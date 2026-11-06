// WORKSの写真から count 枚を表示する。直前に表示した写真は、候補が足りる限り避ける。
export function pickWorks(selector: string, count: number, storageKey: string) {
  const items = Array.from(document.querySelectorAll<HTMLElement>(selector));
  const keyOf = (el: HTMLElement) => el.dataset.image ?? '';

  const shuffle = <T,>(list: T[]) => {
    const a = [...list];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };

  let previous: string[] = [];
  try {
    previous = JSON.parse(localStorage.getItem(storageKey) ?? '[]');
  } catch {}

  const fresh = shuffle(items.filter((el) => !previous.includes(keyOf(el))));
  const repeats = shuffle(items.filter((el) => previous.includes(keyOf(el))));
  const picked = [...fresh, ...repeats].slice(0, count);

  picked.forEach((el) => el.classList.remove('hidden'));

  try {
    localStorage.setItem(storageKey, JSON.stringify(picked.map(keyOf)));
  } catch {}
}
