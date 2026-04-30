import { useState, useCallback } from "react";
import { isLocalLike, toggleLocalLike } from "@/lib/likes";

// ─── Optimistic like ──────────────────────────────────────────────────────────
// Personal like state + optimistic counter. Currently persisted only in
// localStorage since there's no community-likes backend column yet. When the
// backend is added, swap `toggleLocalLike` for a server call and add rollback.

export function useOptimisticLike(templateId: string, initialCount: number) {
  const [liked, setLiked] = useState(() => isLocalLike(templateId));
  const [count, setCount] = useState(initialCount);

  const toggleLike = useCallback(() => {
    setLiked((prev) => {
      const next = !prev;
      setCount((c) => Math.max(0, c + (next ? 1 : -1)));
      toggleLocalLike(templateId);
      return next;
    });
  }, [templateId]);

  return { liked, count, toggleLike };
}
