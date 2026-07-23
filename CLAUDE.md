# opoto-site 開発メモ

Photo and Culture OPOTO の公式サイト（Astro + Tailwind CSS v4）。

## ⚠️ `text-base` は使わないこと

**このプロジェクトで `text-base` を書くと、文字サイズではなく「白文字」になる。**

`src/styles/global.css` の `@theme` で `--color-base: #ffffff` を定義しているため、
Tailwind が `text-base` を**文字色ユーティリティ**として生成してしまう。
背景も白なので、**文字が完全に見えなくなる**（2026-07-23、gallery.astro で実際に発生）。

- ❌ `class="font-heading-ja text-base"` → 白文字で消える
- ⭕️ 標準サイズでよいなら**サイズ指定を書かない**
- ⭕️ 色を明示するなら `text-ink`（本文）／`text-muted`（補助テキスト）

`text-sm` `text-lg` `text-xl` などは衝突しないので通常どおり使える。
今後 `@theme` に色を足すときは、Tailwind の既存ユーティリティ名と被らせないこと。

## カラートークン

| クラス | 値 | 用途 |
| --- | --- | --- |
| `base` | #ffffff | 背景 |
| `surface` | #f5f5f5 | 一段沈んだ面・画像プレースホルダ |
| `ink` | #1a1a1a | 本文・見出し |
| `line` | #e0e0e0 | 罫線・枠線 |
| `muted` | #9e9e9e | 補助テキスト |

## フォント

| クラス | 用途 |
| --- | --- |
| `font-heading-en` | Cormorant Garamond。英字見出し（`SERVICE` `USE` など） |
| `font-heading-ja` | Zen Old Mincho。日本語見出し・料金の数字 |
| `font-body` | Noto Sans JP。本文 |
| `font-logo` | Jost。ロゴ |

## よく使うレイアウトの型

ページ内のセクションは、この形を踏襲する。

```html
<section class="max-w-6xl mx-auto px-6 py-20 border-t-[0.5px] border-line">
  <h2 class="font-heading-en text-2xl tracking-wide mb-10">SECTION</h2>
  ...
</section>
```

- 項目と値を並べる表は `dl` + `divide-y divide-line border-t border-b border-line`
  （例：studio.astro の SET PLAN / OPTION、gallery.astro の USE / SUPPORT）
- 注意書きは `<ul class="space-y-1 text-xs text-muted leading-relaxed">` に `※`
- 文字列にリンクを含めたい場合は `set:html` を使う（gallery.astro の `useNotes` が例）

## 開発サーバー

作業ディレクトリが親フォルダ（`~/Desktop/Claude`）なので、
ルートの `.claude/launch.json` は `npm --prefix opoto-site run dev` を指定している。
ポートは 4321。

```bash
npm --prefix opoto-site run dev
```

## public/ に置くファイル名

**日本語・スペースを使わない。ASCII のハイフン区切りにする。**

macOS はファイル名の濁点・半濁点を分解して保存する（NFD）が、
ブラウザは合成した形（NFC）で要求するため、名前が一致せず 404 になる。
2026-07-23、`OPOTO 展示スペース.pdf` で発生 → `opoto-exhibition-space.pdf` に変更して解決。
