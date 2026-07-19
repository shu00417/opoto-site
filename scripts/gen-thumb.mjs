// note記事のヘッダー画像とタイトルを取得し、CONTENTS用サムネイルを生成する。
// 使い方: node scripts/gen-thumb.mjs <note記事URL> <出力パス>
//   例: node scripts/gen-thumb.mjs https://note.com/opoto_tottori/n/xxxx public/CONTENTS/sigotobito/004.png

import fs from 'node:fs';
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';

const [, , noteUrl, outPath] = process.argv;
if (!noteUrl || !outPath) {
  console.error('使い方: node scripts/gen-thumb.mjs <note記事URL> <出力パス>');
  process.exit(1);
}

// --- レイアウト設定（余白多め・全カード同じサイズに固定） ---
const CANVAS_W = 1200;       // カード幅(px)
const PAD = 84;              // 周囲の余白(px)
const GAP = 60;              // 写真とタイトルの間の余白(px)
const PHOTO_H = 609;         // 写真エリアの高さ(px)。比率違いは中央でトリミング
const FONT_SIZE = 46;        // タイトル文字サイズ(px)
const LINE_HEIGHT = 1.5;
const BASE_TITLE_H = 207;    // タイトルエリアの最小高さ(px)。※Vol.02(3行)を基準に統一。これより長いタイトルは自動で拡張
const INK = '#1a1a1a';
const BG = '#ffffff';

const fontBold = fs.readFileSync(new URL('./fonts/ZenOldMincho-Bold.ttf', import.meta.url));

// HTMLエンティティの簡易デコード
const decode = (s) =>
  s.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&#39;/g, "'")
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(parseInt(d, 10)));

const pickMeta = (html, prop) => {
  const m =
    html.match(new RegExp(`<meta[^>]*property="${prop}"[^>]*content="([^"]*)"`, 'i')) ||
    html.match(new RegExp(`<meta[^>]*content="([^"]*)"[^>]*property="${prop}"`, 'i'));
  return m ? decode(m[1]) : null;
};

console.log('記事を取得中:', noteUrl);
const html = await (await fetch(noteUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } })).text();

let title = pickMeta(html, 'og:title') || '';
title = title.split('｜')[0].trim(); // 末尾の「｜Photo and Culture OPOTO」を除去
const imgUrl = pickMeta(html, 'og:image');
if (!imgUrl) {
  console.error('ヘッダー画像(og:image)が見つかりませんでした。');
  process.exit(1);
}
console.log('タイトル:', title);

const imgBuf = Buffer.from(await (await fetch(imgUrl)).arrayBuffer());
const innerW = CANVAS_W - PAD * 2;
const dataUri = `data:image/jpeg;base64,${imgBuf.toString('base64')}`;
const fonts = [{ name: 'Zen Old Mincho', data: fontBold, weight: 700, style: 'normal' }];
const titleStyle = { display: 'flex', width: innerW, fontSize: FONT_SIZE, fontWeight: 700, lineHeight: LINE_HEIGHT, fontFamily: 'Zen Old Mincho', color: INK };

// タイトルが実際に何pxになるかを測定し、切れないようにエリア高さを決める
const measureSvg = await satori({ type: 'div', props: { style: titleStyle, children: title } }, { width: innerW, fonts });
const measuredH = Math.ceil(parseFloat(measureSvg.match(/height="([\d.]+)"/)[1]));
const titleH = Math.max(BASE_TITLE_H, measuredH);
const CANVAS_H = PAD * 2 + PHOTO_H + GAP + titleH;
console.log(`タイトル高さ(実測): ${measuredH}px / カード高さ: ${CANVAS_W}x${CANVAS_H}px`);

const tree = {
  type: 'div',
  props: {
    style: {
      display: 'flex',
      flexDirection: 'column',
      width: '100%',
      height: '100%',
      backgroundColor: BG,
      padding: `${PAD}px`,
      fontFamily: 'Zen Old Mincho',
    },
    children: [
      // 写真（高さ固定・比率違いは中央でトリミング）
      { type: 'img', props: { src: dataUri, width: innerW, height: PHOTO_H, style: { width: innerW, height: PHOTO_H, objectFit: 'cover' } } },
      { type: 'div', props: { style: { height: GAP } } },
      // タイトル（高さを確保し、その中で上下中央に配置）
      { type: 'div', props: { style: { ...titleStyle, height: titleH, alignItems: 'center' }, children: title } },
    ],
  },
};

const svg = await satori(tree, {
  width: CANVAS_W,
  height: CANVAS_H,
  fonts,
});

const png = new Resvg(svg, { fitTo: { mode: 'width', value: CANVAS_W } }).render().asPng();
fs.writeFileSync(outPath, png);
console.log('生成完了:', outPath, `(${CANVAS_W}x${CANVAS_H}px)`);
