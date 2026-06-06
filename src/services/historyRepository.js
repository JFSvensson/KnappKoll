const STORAGE_KEY = "knappkoll.history.v1";
const MAX_ITEMS = 20;

function parseHistory(rawValue) {
  if (!rawValue) {
    return [];
  }

  try {
    const parsed = JSON.parse(rawValue);
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter(
      (item) =>
        item &&
        typeof item.completedAt === "string" &&
        typeof item.layoutName === "string" &&
        typeof item.levelReached === "number" &&
        typeof item.totalAttempts === "number" &&
        typeof item.totalCorrect === "number" &&
        typeof item.accuracy === "number"
    );
  } catch {
    return [];
  }
}

export function loadHistory() {
  const rawValue = localStorage.getItem(STORAGE_KEY);
  return parseHistory(rawValue);
}

export function saveGameResult(result) {
  const existing = loadHistory();
  const next = [result, ...existing].slice(0, MAX_ITEMS);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  return next;
}
