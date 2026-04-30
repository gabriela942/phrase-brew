// ─── Local per-user template likes ────────────────────────────────────────────
// Community-wide likes require a backend column (not yet available). Until then,
// we track personal likes locally so the heart icon has a real on/off state.

const STORAGE_KEY = "template-likes";

function read(): Set<string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return new Set(raw ? (JSON.parse(raw) as string[]) : []);
  } catch {
    return new Set();
  }
}

function write(set: Set<string>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...set]));
  } catch {
    /* quota / private mode — ignore */
  }
}

export function isLocalLike(id: string): boolean {
  return read().has(id);
}

export function toggleLocalLike(id: string): boolean {
  const set = read();
  if (set.has(id)) set.delete(id);
  else set.add(id);
  write(set);
  return set.has(id);
}
