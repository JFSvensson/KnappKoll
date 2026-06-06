import { ACTIONS } from "./actions.js";

export const initialState = {
  screen: "menu",
  selectedLayoutId: "sv",
  session: null,
  feedback: null,
  summary: null,
  history: [],
  showTip: false,
};

export function reducer(state, action) {
  switch (action.type) {
    case ACTIONS.CHANGE_LAYOUT:
      return {
        ...state,
        selectedLayoutId: action.payload.layoutId,
      };

    case ACTIONS.LOAD_HISTORY:
      return {
        ...state,
        history: action.payload.history,
      };

    case ACTIONS.START_GAME:
      return {
        ...state,
        screen: "game",
        session: action.payload.session,
        summary: null,
        feedback: null,
        showTip: false,
      };

    case ACTIONS.SUBMIT_ANSWER:
      return {
        ...state,
        session: action.payload.session,
        feedback: action.payload.feedback,
      };

    case ACTIONS.FINISH_GAME:
      return {
        ...state,
        screen: "summary",
        summary: action.payload.summary,
        session: null,
        feedback: null,
        history: action.payload.history,
        showTip: false,
      };

    case ACTIONS.RESET_GAME:
      return {
        ...state,
        screen: "menu",
        session: null,
        feedback: null,
        summary: null,
        showTip: false,
      };

    case ACTIONS.TOGGLE_TIP:
      return {
        ...state,
        showTip: !state.showTip,
      };

    default:
      return state;
  }
}
