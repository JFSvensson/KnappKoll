const LEVELS = [
  {
    id: "home-row",
    title: "Niva 1: Hemrad",
    keyCodes: ["KeyA", "KeyS", "KeyD", "KeyF", "KeyJ", "KeyK", "KeyL", "Semicolon"],
    questionsPerLevel: 10,
    passAccuracy: 0.7,
    mode: "classic"
  },
  {
    id: "top-row",
    title: "Niva 2: Ovre rad",
    keyCodes: ["KeyQ", "KeyW", "KeyE", "KeyR", "KeyT", "KeyY", "KeyU", "KeyI", "KeyO", "KeyP"],
    questionsPerLevel: 10,
    passAccuracy: 0.75,
    mode: "classic"
  },
  {
    id: "bottom-row",
    title: "Niva 3: Nedre rad",
    keyCodes: ["KeyZ", "KeyX", "KeyC", "KeyV", "KeyB", "KeyN", "KeyM", "Comma", "Period", "Slash"],
    questionsPerLevel: 10,
    passAccuracy: 0.75,
    mode: "classic"
  },
  {
    id: "numbers-and-symbols",
    title: "Niva 4: Siffror och symboler",
    keyCodes: ["Digit1", "Digit2", "Digit3", "Digit4", "Digit5", "Digit6", "Digit7", "Digit8", "Digit9", "Digit0", "Minus", "Equal"],
    questionsPerLevel: 12,
    passAccuracy: 0.8,
    mode: "classic"
  },
  {
    id: "blank-keyboard",
    title: "Niva 5: Tomt tangentbord",
    keyCodes: [
      "KeyQ", "KeyW", "KeyE", "KeyR", "KeyT", "KeyY", "KeyU", "KeyI", "KeyO", "KeyP",
      "KeyA", "KeyS", "KeyD", "KeyF", "KeyG", "KeyH", "KeyJ", "KeyK", "KeyL",
      "KeyZ", "KeyX", "KeyC", "KeyV", "KeyB", "KeyN", "KeyM",
      "Digit1", "Digit2", "Digit3", "Digit4", "Digit5", "Digit6", "Digit7", "Digit8", "Digit9", "Digit0",
      "Minus", "Equal", "Semicolon", "Quote", "Comma", "Period", "Slash", "BracketLeft", "BracketRight"
    ],
    questionsPerLevel: 45,
    passAccuracy: 1,
    mode: "blank-map"
  }
];

function cloneSession(session) {
  return {
    ...session,
    passedLevels: session.passedLevels.map((level) => ({ ...level })),
    filledCodes: [...session.filledCodes]
  };
}

function getTargetPool(level, session) {
  if (level.mode !== "blank-map") {
    return level.keyCodes;
  }

  return level.keyCodes.filter((code) => !session.filledCodes.includes(code));
}

function randomCodeFromPool(pool, previousCode) {
  if (pool.length === 0) {
    return null;
  }

  if (pool.length === 1) {
    return pool[0];
  }

  let candidate = pool[Math.floor(Math.random() * pool.length)];
  while (candidate === previousCode) {
    candidate = pool[Math.floor(Math.random() * pool.length)];
  }
  return candidate;
}

function prepareNextTarget(session) {
  const level = LEVELS[session.levelIndex];
  const targetPool = getTargetPool(level, session);
  return {
    ...session,
    currentTargetCode: randomCodeFromPool(targetPool, session.currentTargetCode)
  };
}

function resolveStartLevelIndex(startLevelId) {
  if (!startLevelId) {
    return 0;
  }

  const index = LEVELS.findIndex((level) => level.id === startLevelId);
  return index >= 0 ? index : 0;
}

export function createSession(layoutId, options = {}) {
  const startLevelIndex = resolveStartLevelIndex(options.startLevelId);
  return prepareNextTarget({
    layoutId,
    startedAt: new Date().toISOString(),
    levelIndex: startLevelIndex,
    levelAttempts: 0,
    levelCorrect: 0,
    overallAttempts: 0,
    overallCorrect: 0,
    currentTargetCode: null,
    passedLevels: [],
    filledCodes: []
  });
}

export function getLevels() {
  return LEVELS.map((level) => ({ ...level, keyCodes: [...level.keyCodes] }));
}

export function evaluateAnswer(session, answerCode) {
  const current = cloneSession(session);
  const level = LEVELS[current.levelIndex];
  const isBlankKeyboardLevel = level.mode === "blank-map";

  const isCorrect = answerCode === current.currentTargetCode;
  current.levelAttempts += 1;
  current.overallAttempts += 1;

  let wasNewPlacement = false;
  if (isCorrect) {
    current.levelCorrect += 1;
    current.overallCorrect += 1;

    if (isBlankKeyboardLevel && !current.filledCodes.includes(answerCode)) {
      current.filledCodes.push(answerCode);
      wasNewPlacement = true;
    }
  }

  const levelCompleted = isBlankKeyboardLevel
    ? current.filledCodes.length >= level.keyCodes.length
    : current.levelAttempts >= level.questionsPerLevel;
  const levelAccuracy = current.levelAttempts === 0 ? 0 : current.levelCorrect / current.levelAttempts;

  if (!levelCompleted) {
    return {
      session: prepareNextTarget(current),
      outcome: {
        isCorrect,
        wasNewPlacement,
        levelCompleted: false,
        levelPassed: false,
        gameCompleted: false,
        levelAccuracy,
        levelMode: level.mode,
        filledCount: current.filledCodes.length,
        totalToFill: level.keyCodes.length
      }
    };
  }

  const levelPassed = isBlankKeyboardLevel ? true : levelAccuracy >= level.passAccuracy;
  if (levelPassed) {
    current.passedLevels.push({
      levelId: level.id,
      title: level.title,
      attempts: current.levelAttempts,
      correct: current.levelCorrect,
      accuracy: levelAccuracy,
      mode: level.mode
    });

    const isFinalLevel = current.levelIndex === LEVELS.length - 1;
    if (isFinalLevel) {
      return {
        session: {
          ...current,
          currentTargetCode: null
        },
        outcome: {
          isCorrect,
          wasNewPlacement,
          levelCompleted: true,
          levelPassed: true,
          gameCompleted: true,
          levelAccuracy,
          levelMode: level.mode,
          filledCount: current.filledCodes.length,
          totalToFill: level.keyCodes.length
        }
      };
    }

    const leveledUp = {
      ...current,
      levelIndex: current.levelIndex + 1,
      levelAttempts: 0,
      levelCorrect: 0,
      currentTargetCode: null,
      filledCodes: []
    };

    return {
      session: prepareNextTarget(leveledUp),
      outcome: {
        isCorrect,
        wasNewPlacement,
        levelCompleted: true,
        levelPassed: true,
        gameCompleted: false,
        levelAccuracy,
        levelMode: level.mode,
        filledCount: current.filledCodes.length,
        totalToFill: level.keyCodes.length
      }
    };
  }

  const retryLevel = {
    ...current,
    levelAttempts: 0,
    levelCorrect: 0,
    currentTargetCode: null,
    filledCodes: []
  };

  return {
    session: prepareNextTarget(retryLevel),
    outcome: {
      isCorrect,
      wasNewPlacement,
      levelCompleted: true,
      levelPassed: false,
      gameCompleted: false,
      levelAccuracy,
      levelMode: level.mode,
      filledCount: current.filledCodes.length,
      totalToFill: level.keyCodes.length
    }
  };
}

export function buildSummary(session) {
  const overallAccuracy = session.overallAttempts === 0 ? 0 : session.overallCorrect / session.overallAttempts;
  return {
    completedAt: new Date().toISOString(),
    layoutId: session.layoutId,
    overallAttempts: session.overallAttempts,
    overallCorrect: session.overallCorrect,
    overallAccuracy,
    passedLevels: session.passedLevels
  };
}

export function getCurrentLevel(session) {
  return LEVELS[session.levelIndex] || null;
}
