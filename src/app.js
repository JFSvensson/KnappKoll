import { createSession, evaluateAnswer, buildSummary, getCurrentLevel } from "./core/gameEngine.js";
import { getLayout } from "./core/layouts.js";
import { loadHistory, saveGameResult } from "./services/historyRepository.js";
import { ACTIONS } from "./state/actions.js";
import { reducer, initialState } from "./state/reducer.js";
import { createStore } from "./state/store.js";
import { renderApp } from "./ui/renderers.js";
import { createInputAdapter } from "./ui/inputAdapter.js";

const rootElement = document.getElementById("app");
const store = createStore(reducer, initialState);

function buildStoredResult(summary) {
  const layout = getLayout(summary.layoutId);
  return {
    completedAt: summary.completedAt,
    layoutName: layout.title,
    levelReached: summary.passedLevels.length,
    totalAttempts: summary.overallAttempts,
    totalCorrect: summary.overallCorrect,
    accuracy: summary.overallAccuracy,
  };
}

function startGame() {
  const state = store.getState();
  const session = createSession(state.selectedLayoutId);
  store.dispatch({
    type: ACTIONS.START_GAME,
    payload: { session },
  });
}

function finishGame(finalSession, finishMessage) {
  const summary = buildSummary(finalSession);
  const storedResult = buildStoredResult(summary);
  const history = saveGameResult(storedResult);
  store.dispatch({
    type: ACTIONS.FINISH_GAME,
    payload: {
      summary: {
        layoutName: storedResult.layoutName,
        levelReached: storedResult.levelReached,
        totalAttempts: storedResult.totalAttempts,
        totalCorrect: storedResult.totalCorrect,
        accuracy: storedResult.accuracy,
        passedLevels: summary.passedLevels,
      },
      history,
      finishMessage,
    },
  });
}

function submitAnswer(code) {
  const state = store.getState();
  if (state.screen !== "game" || !state.session) {
    return;
  }

  const previousLevel = getCurrentLevel(state.session);
  const result = evaluateAnswer(state.session, code);
  const isBlankKeyboardLevel = previousLevel.mode === "blank-map";

  let feedback;
  if (!result.outcome.levelCompleted) {
    if (isBlankKeyboardLevel) {
      feedback = result.outcome.isCorrect
        ? {
            kind: "ok",
            text: `Ratt plats! ${result.outcome.filledCount}/${result.outcome.totalToFill} ifyllda.`,
          }
        : { kind: "bad", text: "Fel plats, forsok igen." };
    } else {
      feedback = result.outcome.isCorrect
        ? { kind: "ok", text: "Ratt tangent!" }
        : { kind: "bad", text: "Fel tangent, forsok igen." };
    }
  } else if (result.outcome.levelPassed) {
    feedback = {
      kind: "ok",
      text: result.outcome.gameCompleted
        ? "Alla nivaer avklarade!"
        : `${previousLevel.title} klarad. Nasta niva startar nu.`,
    };
  } else {
    feedback = {
      kind: "bad",
      text: `${previousLevel.title} behover mer traning. Nivan startas om.`,
    };
  }

  store.dispatch({
    type: ACTIONS.SUBMIT_ANSWER,
    payload: {
      session: result.session,
      feedback,
    },
  });

  if (result.outcome.gameCompleted) {
    finishGame(result.session, "Spel avslutat");
  }
}

function attachUiActions() {
  rootElement.addEventListener("click", (event) => {
    const actionElement = event.target.closest("[data-action]");
    if (!actionElement) {
      return;
    }

    const action = actionElement.getAttribute("data-action");
    if (action === "start-game" || action === "play-again") {
      startGame();
      return;
    }

    if (action === "back-to-menu") {
      store.dispatch({ type: ACTIONS.RESET_GAME });
      return;
    }

    if (action === "select-layout") {
      const layoutId = actionElement.getAttribute("data-layout-id");
      if (!layoutId) {
        return;
      }
      store.dispatch({
        type: ACTIONS.CHANGE_LAYOUT,
        payload: { layoutId },
      });
    }
  });
}

function bootstrap() {
  if (!rootElement) {
    throw new Error("App root saknas");
  }

  store.dispatch({
    type: ACTIONS.LOAD_HISTORY,
    payload: { history: loadHistory() },
  });

  store.subscribe((state) => {
    renderApp(rootElement, state);
  });

  renderApp(rootElement, store.getState());
  attachUiActions();

  const inputAdapter = createInputAdapter({ onCodeInput: submitAnswer });
  inputAdapter.attach(rootElement, () => {
    const state = store.getState();
    if (!state.session) {
      return state.selectedLayoutId;
    }
    return state.session.layoutId;
  });
}

bootstrap();
