import { getLayout, getKeyLabel, LAYOUTS } from "../core/layouts.js";
import { getCurrentLevel, getLevels } from "../core/gameEngine.js";

function toPercent(value) {
  return `${Math.round(value * 100)}%`;
}

function getFeedbackClass(feedback) {
  if (!feedback) {
    return "feedback";
  }
  if (feedback.kind === "ok") {
    return "feedback ok";
  }
  return "feedback bad";
}

function renderLayoutButtons(selectedLayoutId) {
  return Object.values(LAYOUTS)
    .map((layout) => {
      const selected = layout.id === selectedLayoutId;
      return `<button class="layout-button" data-action="select-layout" data-layout-id="${layout.id}" data-selected="${selected}">${layout.title}</button>`;
    })
    .join("");
}

function renderMenu(state) {
  return `
    <section class="panel menu-grid">
      <h2>Starta traning</h2>
      <p>Valj layout och starta spelet. Du klarar en niva genom att na tillracklig precision.</p>
      <div>
        <h3>Layout</h3>
        <div class="layout-buttons">${renderLayoutButtons(state.selectedLayoutId)}</div>
      </div>
      <div class="actions">
        <button class="button primary" data-action="start-game">Starta spel</button>
        <button class="button" data-action="start-blank-game">Starta tomt tangentbord</button>
      </div>
      <section>
        <h3>Senaste rundor</h3>
        ${renderHistory(state.history)}
      </section>
    </section>
  `;
}

function renderKeyboard(layout, targetCode, options = {}) {
  const filledCodes = options.filledCodes || [];
  const hideLabels = Boolean(options.hideLabels);
  const showTip = Boolean(options.showTip);

  const rows = layout.rows
    .map((row) => {
      const keys = row
        .map((code) => {
          const widthClass = code === "Space" ? "space" : ["Backspace", "Tab", "CapsLock", "Enter", "ShiftLeft", "ShiftRight"].includes(code) ? "wide" : "";
          const targetClass = showTip && code === targetCode ? "target" : "";
          const isFilled = filledCodes.includes(code);
          const fillClass = hideLabels ? (isFilled ? "filled" : "empty") : "";
          const label = hideLabels && !isFilled ? "?" : getKeyLabel(layout, code);
          return `<button class="key ${widthClass} ${targetClass} ${fillClass}" data-action="virtual-key" data-code="${code}">${label}</button>`;
        })
        .join("");
      return `<div class="keyboard-row">${keys}</div>`;
    })
    .join("");

  return `<section class="keyboard">${rows}</section>`;
}

function renderGame(state) {
  const session = state.session;
  const level = getCurrentLevel(session);
  const levels = getLevels();
  const layout = getLayout(session.layoutId);
  const feedbackText = state.feedback ? state.feedback.text : "Vanta pa ditt nasta svar";
  const isBlankKeyboardLevel = level.mode === "blank-map";
  const progressText = isBlankKeyboardLevel
    ? `${session.filledCodes.length}/${level.keyCodes.length}`
    : `${session.levelAttempts}/${level.questionsPerLevel}`;
  const targetHeading = isBlankKeyboardLevel ? "Placera tangent pa ratt plats:" : "Hitta tangent:";
  const keyboardHelpText = isBlankKeyboardLevel
    ? "Tangenterna ar dolda. Klicka pa platsen dar tangenten hor hemma."
    : "Du kan anvanda fysiskt tangentbord eller trycka direkt pa tangenterna.";
  const tipText = state.showTip
    ? "Tips aktivt: ratt position markeras pa tangentbordet."
    : "Tips av: ingen markering visas automatiskt.";

  return `
    <section class="game-grid">
      <section class="panel">
        <h2>${level.title}</h2>
        <div class="hud">
          <article class="hud-card">
            <strong>${isBlankKeyboardLevel ? "Placerade" : "Forsok i niva"}</strong>
            <div>${progressText}</div>
          </article>
          <article class="hud-card">
            <strong>Ratt i niva</strong>
            <div>${session.levelCorrect}</div>
          </article>
          <article class="hud-card">
            <strong>Total precision</strong>
            <div>${session.overallAttempts === 0 ? "-" : toPercent(session.overallCorrect / session.overallAttempts)}</div>
          </article>
          <article class="hud-card">
            <strong>Niva</strong>
            <div>${session.levelIndex + 1}/${levels.length}</div>
          </article>
        </div>
        <div class="target-box">
          <div>${targetHeading}</div>
          <div class="target-label">${getKeyLabel(layout, session.currentTargetCode)}</div>
        </div>
        <div class="${getFeedbackClass(state.feedback)}">${feedbackText}</div>
        <div class="actions">
          <button class="button" data-action="toggle-tip">${state.showTip ? "Dolj tips" : "Visa tips"}</button>
          <button class="button" data-action="back-to-menu">Avsluta runda</button>
        </div>
      </section>
      <section class="panel">
        <h3>Virtuellt tangentbord (${layout.title})</h3>
        <p>${keyboardHelpText}</p>
        <p>${tipText}</p>
        ${renderKeyboard(layout, session.currentTargetCode, {
          hideLabels: isBlankKeyboardLevel,
          filledCodes: session.filledCodes,
          showTip: state.showTip,
        })}
      </section>
    </section>
  `;
}

function renderPassedLevels(summary) {
  if (!summary.passedLevels.length) {
    return "<p>Ingen niva klarades i denna runda.</p>";
  }

  const list = summary.passedLevels
    .map((item) => `<li>${item.title}: ${item.correct}/${item.attempts} (${toPercent(item.accuracy)})</li>`)
    .join("");

  return `<ul class="history-list">${list}</ul>`;
}

function formatDate(isoDate) {
  const date = new Date(isoDate);
  return date.toLocaleString("sv-SE", {
    dateStyle: "short",
    timeStyle: "short",
  });
}

function renderHistory(history) {
  if (!history.length) {
    return "<p>Ingen historik an sa lange.</p>";
  }

  const items = history
    .map((entry) => `<li>${formatDate(entry.completedAt)} - ${entry.layoutName}, niva ${entry.levelReached}, precision ${toPercent(entry.accuracy)} (${entry.totalCorrect}/${entry.totalAttempts})</li>`)
    .join("");

  return `<ol class="history-list">${items}</ol>`;
}

function renderSummary(state) {
  const summary = state.summary;
  return `
    <section class="panel summary-grid">
      <h2>Sammanfattning</h2>
      <p>Layout: <strong>${summary.layoutName}</strong></p>
      <p>Totalt ratt: <strong>${summary.totalCorrect}</strong> av <strong>${summary.totalAttempts}</strong></p>
      <p>Total precision: <strong>${toPercent(summary.accuracy)}</strong></p>
      <p>Niva natt: <strong>${summary.levelReached}</strong></p>
      <section>
        <h3>Klarade nivaer</h3>
        ${renderPassedLevels(summary)}
      </section>
      <section>
        <h3>Historik</h3>
        ${renderHistory(state.history)}
      </section>
      <div class="actions">
        <button class="button primary" data-action="play-again">Spela igen</button>
        <button class="button" data-action="back-to-menu">Till meny</button>
      </div>
    </section>
  `;
}

export function renderApp(rootElement, state) {
  if (state.screen === "game") {
    rootElement.innerHTML = renderGame(state);
    return;
  }

  if (state.screen === "summary") {
    rootElement.innerHTML = renderSummary(state);
    return;
  }

  rootElement.innerHTML = renderMenu(state);
}
