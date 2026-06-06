const LEVELS = [
  {
    id: "home-row",
    title: "Niva 1: Hemrad",
    keyCodes: ["KeyA", "KeyS", "KeyD", "KeyF", "KeyJ", "KeyK", "KeyL", "Semicolon"],
    questionsPerLevel: 10,
    passAccuracy: 0.7
  },
  {
    id: "top-row",
    title: "Niva 2: Ovre rad",
    keyCodes: ["KeyQ", "KeyW", "KeyE", "KeyR", "KeyT", "KeyY", "KeyU", "KeyI", "KeyO", "KeyP"],
    questionsPerLevel: 10,
    passAccuracy: 0.75
  },
  {
    id: "bottom-row",
    title: "Niva 3: Nedre rad",
    keyCodes: ["KeyZ", "KeyX", "KeyC", "KeyV", "KeyB", "KeyN", "KeyM", "Comma", "Period", "Slash"],
    questionsPerLevel: 10,
    passAccuracy: 0.75
  },
  {
    id: "numbers-and-symbols",
    title: "Niva 4: Siffror och symboler",
    keyCodes: ["Digit1", "Digit2", "Digit3", "Digit4", "Digit5", "Digit6", "Digit7", "Digit8", "Digit9", "Digit0", "Minus", "Equal"],
    questionsPerLevel: 12,
    passAccuracy: 0.8
  }
];

function cloneSession(session) {
  return {
    ...session,
    passedLevels: session.passedLevels.map((level) => ({ ...level }))
  };
}

function randomCodeFromLevel(level, previousCode) {
  if (level.keyCodes.length === 1) {
    return level.keyCodes[0];
  }

  let candidate = level.keyCodes[Math.floor(Math.random() * level.keyCodes.length)];
  while (candidate === previousCode) {
    candidate = level.keyCodes[Math.floor(Math.random() * level.keyCodes.length)];
  }
  return candidate;
}

function prepareNextTarget(session) {
  const level = LEVELS[session.levelIndex];
  return {
    ...session,
    currentTargetCode: randomCodeFromLevel(level, session.currentTargetCode)
  };
}

export function createSession(layoutId) {
  return prepareNextTarget({
    layoutId,
    startedAt: new Date().toISOString(),
    levelIndex: 0,
    levelAttempts: 0,
    levelCorrect: 0,
    overallAttempts: 0,
    overallCorrect: 0,
    currentTargetCode: null,
    passedLevels: []
  });
}

export function getLevels() {
  return LEVELS.map((level) => ({ ...level, keyCodes: [...level.keyCodes] }));
}

export function evaluateAnswer(session, answerCode) {
  const current = cloneSession(session);
  const level = LEVELS[current.levelIndex];

  const isCorrect = answerCode === current.currentTargetCode;
  current.levelAttempts += 1;
  current.overallAttempts += 1;

  if (isCorrect) {
    current.levelCorrect += 1;
    current.overallCorrect += 1;
  }

  const levelCompleted = current.levelAttempts >= level.questionsPerLevel;
  const levelAccuracy = current.levelAttempts === 0 ? 0 : current.levelCorrect / current.levelAttempts;

  if (!levelCompleted) {
    return {
      session: prepareNextTarget(current),
      outcome: {
        isCorrect,
        levelCompleted: false,
        levelPassed: false,
        gameCompleted: false,
        levelAccuracy
      }
    };
  }

  const levelPassed = levelAccuracy >= level.passAccuracy;
  if (levelPassed) {
    current.passedLevels.push({
      levelId: level.id,
      title: level.title,
      attempts: current.levelAttempts,
      correct: current.levelCorrect,
      accuracy: levelAccuracy
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
          levelCompleted: true,
          levelPassed: true,
          gameCompleted: true,
          levelAccuracy
        }
      };
    }

    const leveledUp = {
      ...current,
      levelIndex: current.levelIndex + 1,
      levelAttempts: 0,
      levelCorrect: 0,
      currentTargetCode: null
    };

    return {
      session: prepareNextTarget(leveledUp),
      outcome: {
        isCorrect,
        levelCompleted: true,
        levelPassed: true,
        gameCompleted: false,
        levelAccuracy
      }
    };
  }

  const retryLevel = {
    ...current,
    levelAttempts: 0,
    levelCorrect: 0,
    currentTargetCode: null
  };

  return {
    session: prepareNextTarget(retryLevel),
    outcome: {
      isCorrect,
      levelCompleted: true,
      levelPassed: false,
      gameCompleted: false,
      levelAccuracy
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
