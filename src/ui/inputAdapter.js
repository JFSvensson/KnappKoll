import { isSupportedCode } from "../core/layouts.js";

export function createInputAdapter({ onCodeInput }) {
  function handleKeyboardInput(event, layoutId) {
    if (!event.code) {
      return;
    }
    if (!isSupportedCode(layoutId, event.code)) {
      return;
    }
    event.preventDefault();
    onCodeInput(event.code);
  }

  function attach(rootElement, getLayoutId) {
    const keyboardListener = (event) => handleKeyboardInput(event, getLayoutId());
    const clickListener = (event) => {
      const target = event.target.closest("[data-action='virtual-key']");
      if (!target) {
        return;
      }
      const code = target.getAttribute("data-code");
      if (!code) {
        return;
      }
      onCodeInput(code);
    };

    document.addEventListener("keydown", keyboardListener);
    rootElement.addEventListener("click", clickListener);

    return () => {
      document.removeEventListener("keydown", keyboardListener);
      rootElement.removeEventListener("click", clickListener);
    };
  }

  return {
    attach,
  };
}
