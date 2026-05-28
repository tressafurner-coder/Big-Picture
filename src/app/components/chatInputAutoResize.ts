const CHAT_INPUT_MIN_HEIGHT_PX = 42;
const CHAT_INPUT_MAX_HEIGHT_PX = 128;

/** Grow chat prompt field with content, capped at ~5 lines. */
export function resizeChatInput(textarea: HTMLTextAreaElement | null) {
  if (!textarea) return;
  textarea.style.height = "auto";
  const next = Math.min(textarea.scrollHeight, CHAT_INPUT_MAX_HEIGHT_PX);
  textarea.style.height = `${Math.max(next, CHAT_INPUT_MIN_HEIGHT_PX)}px`;
}
