import type { ImageMetadata } from 'astro';
import captionData from './works-captions.json';

// 写真ごとの「撮影の種類(title)」「ひとこと説明(note)」。キーはファイル番号（例: "032"）。空なら何も表示しない。
const captions: Record<string, { title?: string; note?: string }> = captionData;

const glob = import.meta.glob<{ default: ImageMetadata }>('../assets/photos/service_work/**', {
  eager: true,
});

export const workItems = Object.entries(glob)
  .sort(([a], [b]) => a.localeCompare(b))
  .map(([path, m]) => {
    const key = path.split('/').pop()?.replace(/\.[^.]+$/, '') ?? '';
    const caption = captions[key];
    return { img: m.default, title: caption?.title ?? '', note: caption?.note ?? '' };
  });
