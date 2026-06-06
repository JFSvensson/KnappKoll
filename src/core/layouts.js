const BASE_ROWS = [
  ["Backquote", "Digit1", "Digit2", "Digit3", "Digit4", "Digit5", "Digit6", "Digit7", "Digit8", "Digit9", "Digit0", "Minus", "Equal", "Backspace"],
  ["Tab", "KeyQ", "KeyW", "KeyE", "KeyR", "KeyT", "KeyY", "KeyU", "KeyI", "KeyO", "KeyP", "BracketLeft", "BracketRight", "Backslash"],
  ["CapsLock", "KeyA", "KeyS", "KeyD", "KeyF", "KeyG", "KeyH", "KeyJ", "KeyK", "KeyL", "Semicolon", "Quote", "Enter"],
  ["ShiftLeft", "KeyZ", "KeyX", "KeyC", "KeyV", "KeyB", "KeyN", "KeyM", "Comma", "Period", "Slash", "ShiftRight"],
  ["Space"]
];

const SPECIAL_WIDTH = {
  Backspace: "wide",
  Tab: "wide",
  CapsLock: "wide",
  Enter: "wide",
  ShiftLeft: "wide",
  ShiftRight: "wide",
  Space: "space"
};

const COMMON_LABELS = {
  Backspace: "Backspace",
  Tab: "Tab",
  CapsLock: "Caps",
  Enter: "Enter",
  ShiftLeft: "Shift",
  ShiftRight: "Shift",
  Space: "Space",
  Comma: ",",
  Period: ".",
  Slash: "/",
  Backslash: "\\",
  Minus: "-",
  Equal: "=",
  Backquote: "`",
  BracketLeft: "[",
  BracketRight: "]",
  Semicolon: ";",
  Quote: "'"
};

function letterLabel(code) {
  if (code.startsWith("Key")) {
    return code.slice(3);
  }
  if (code.startsWith("Digit")) {
    return code.slice(5);
  }
  return COMMON_LABELS[code] || code;
}

function buildLabels(overrides) {
  const labels = {};
  for (const row of BASE_ROWS) {
    for (const code of row) {
      labels[code] = overrides[code] || letterLabel(code);
    }
  }
  return labels;
}

const SV_OVERRIDES = {
  Backquote: "§",
  Minus: "+",
  Equal: "´",
  BracketLeft: "Å",
  Semicolon: "Ö",
  Quote: "Ä",
  Backslash: "'"
};

const US_OVERRIDES = {
  Backquote: "`",
  Minus: "-",
  Equal: "=",
  BracketLeft: "[",
  BracketRight: "]",
  Semicolon: ";",
  Quote: "'",
  Backslash: "\\"
};

export const LAYOUTS = {
  sv: {
    id: "sv",
    title: "Svensk QWERTY",
    rows: BASE_ROWS,
    labels: buildLabels(SV_OVERRIDES)
  },
  us: {
    id: "us",
    title: "US QWERTY",
    rows: BASE_ROWS,
    labels: buildLabels(US_OVERRIDES)
  }
};

export const PLAYABLE_CODES = BASE_ROWS.flat().filter((code) => !["Tab", "CapsLock", "ShiftLeft", "ShiftRight", "Backspace", "Enter"].includes(code));

export function getLayout(layoutId) {
  return LAYOUTS[layoutId] || LAYOUTS.sv;
}

export function getKeyLabel(layout, code) {
  return layout.labels[code] || code;
}

export function isSupportedCode(layoutId, code) {
  const layout = getLayout(layoutId);
  return Object.prototype.hasOwnProperty.call(layout.labels, code);
}
