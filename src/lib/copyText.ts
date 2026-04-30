// ─── Robust clipboard copy ────────────────────────────────────────────────────
// Modern `navigator.clipboard.writeText` rejects with `NotAllowedError` when
// the document has lost focus (e.g. after a user clicks into an <iframe
// srcDoc>). We try the modern API first with a forced focus return, then fall
// back to the legacy `document.execCommand("copy")` via a temporary textarea.
// Returns true on success, false otherwise. Never throws.

export async function copyTextRobust(text: string): Promise<boolean> {
  if (!text || !text.trim()) {
    console.error("[copyTextRobust] Texto vazio");
    return false;
  }

  const normalized = text.trim();

  // ── Attempt 1: modern Clipboard API ──────────────────────────────────────
  try {
    window.focus();
    await new Promise((resolve) => setTimeout(resolve, 30));

    if (navigator?.clipboard?.writeText) {
      await navigator.clipboard.writeText(normalized);
      return true;
    }
  } catch (error) {
    console.warn(
      "[copyTextRobust] Clipboard API falhou, tentando fallback",
      error
    );
  }

  // ── Attempt 2: legacy textarea + execCommand ─────────────────────────────
  try {
    const textarea = document.createElement("textarea");
    textarea.value = normalized;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    textarea.style.left = "-9999px";
    textarea.style.top = "0";
    textarea.style.pointerEvents = "none";

    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    textarea.setSelectionRange(0, normalized.length);

    const success = document.execCommand("copy");
    document.body.removeChild(textarea);
    return success;
  } catch (error) {
    console.error("[copyTextRobust] Fallback falhou", error);
    return false;
  }
}
