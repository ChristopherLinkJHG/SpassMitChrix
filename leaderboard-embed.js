(function () {
  const root = document.getElementById("gs-leaderboard");
  const list = document.getElementById("gs-leaderboard-list");
  const status = document.getElementById("gs-status");

  if (!root || !list) {
    return;
  }

  const apiBase = (root.dataset.apiBase || "http://johannes1.local:5000").replace(/\/+$/, "");
  const defaultGame = (root.dataset.game || "my-game").trim();

  const parsedLimit = Number(root.dataset.limit || "10");
  const limit = Number.isFinite(parsedLimit) && parsedLimit > 0 ? Math.floor(parsedLimit) : 10;

  const parsedRefreshMs = Number(root.dataset.refreshMs || "5000");
  const refreshMs = Number.isFinite(parsedRefreshMs) && parsedRefreshMs >= 1000 ? Math.floor(parsedRefreshMs) : 5000;

  const maxLogLines = 30;
  const logContainer = document.createElement("div");
  logContainer.id = "gs-debug-log";
  logContainer.setAttribute("aria-live", "polite");
  logContainer.style.margin = "10px 0 0";
  logContainer.style.padding = "8px";
  logContainer.style.borderRadius = "8px";
  logContainer.style.background = "rgba(0,0,0,0.18)";
  logContainer.style.fontSize = "12px";
  logContainer.style.maxHeight = "220px";
  logContainer.style.overflow = "auto";

  const logTitle = document.createElement("strong");
  logTitle.textContent = "Debug-Log";
  logTitle.style.display = "block";
  logTitle.style.marginBottom = "6px";

  const logList = document.createElement("ul");
  logList.style.margin = "0";
  logList.style.paddingLeft = "18px";

  logContainer.appendChild(logTitle);
  logContainer.appendChild(logList);
  root.parentNode?.appendChild(logContainer);

  function addLog(message, isError) {
    const line = document.createElement("li");
    const now = new Date();
    const hh = String(now.getHours()).padStart(2, "0");
    const mm = String(now.getMinutes()).padStart(2, "0");
    const ss = String(now.getSeconds()).padStart(2, "0");
    line.textContent = `[${hh}:${mm}:${ss}] ${message}`;
    if (isError) {
      line.style.color = "#ffb3b3";
    }
    logList.appendChild(line);

    while (logList.children.length > maxLogLines) {
      logList.removeChild(logList.firstChild);
    }

    logContainer.scrollTop = logContainer.scrollHeight;
  }

  function isFullScoresEndpoint(url) {
    return /\/api\/scores$/i.test(url);
  }

  function getScoresCollectionUrl(gameName, limitValue) {
    const baseUrl = isFullScoresEndpoint(apiBase) ? apiBase : `${apiBase}/api/scores`;
    return `${baseUrl}?game=${encodeURIComponent(gameName)}&limit=${encodeURIComponent(String(limitValue))}`;
  }

  function getScoresSubmitUrl() {
    return isFullScoresEndpoint(apiBase) ? apiBase : `${apiBase}/api/scores`;
  }

  function setStatus(message, isError) {
    if (!status) {
      return;
    }

    status.textContent = message;
    status.style.color = isError ? "#b00020" : "";
  }

  function renderLeaderboard(scores) {
    list.innerHTML = "";

    if (!Array.isArray(scores) || scores.length === 0) {
      const emptyItem = document.createElement("li");
      emptyItem.textContent = "Noch keine Scores vorhanden.";
      list.appendChild(emptyItem);
      return;
    }

    scores.forEach((entry, index) => {
      const item = document.createElement("li");
      const player = typeof entry.player_name === "string" ? entry.player_name : "Unknown";
      const score = Number.isFinite(Number(entry.score)) ? Number(entry.score) : 0;
      item.textContent = `${index + 1}. ${player} - ${score}`;
      list.appendChild(item);
    });
  }

  async function loadLeaderboard() {
    try {
      const url = getScoresCollectionUrl(defaultGame, limit);
      addLog(`GET ${url}`, false);
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const scores = await response.json();
      const normalizedScores = Array.isArray(scores) ? scores : Array.isArray(scores?.scores) ? scores.scores : [];
      renderLeaderboard(normalizedScores);
      setStatus("Leaderboard aktualisiert.", false);
      addLog(`Leaderboard geladen (${normalizedScores.length} Einträge).`, false);
    } catch (error) {
      setStatus("Leaderboard konnte nicht geladen werden.", true);
      addLog(`GET fehlgeschlagen: ${error instanceof Error ? error.message : String(error)}`, true);
    }
  }

  async function submitGameScore(playerName, score, game) {
    if (typeof playerName !== "string" || playerName.trim() === "") {
      throw new Error("playerName must be a non-empty string");
    }

    const numericScore = Number(score);
    if (!Number.isFinite(numericScore)) {
      throw new Error("score must be a finite number");
    }

    const selectedGame = typeof game === "string" && game.trim() !== "" ? game.trim() : defaultGame;

    const payload = {
      playerName: playerName.trim(),
      player_name: playerName.trim(),
      game: selectedGame,
      score: numericScore,
    };

    const submitUrl = getScoresSubmitUrl();
    addLog(`POST ${submitUrl} payload=${JSON.stringify(payload)}`, false);

    const response = await fetch(submitUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const json = await response.json();

    if (json && json.success === false) {
      throw new Error("submit failed");
    }

    setStatus("Score erfolgreich gesendet.", false);
    addLog("Score erfolgreich gesendet.", false);
    await loadLeaderboard();

    return json;
  }

  window.submitGameScore = submitGameScore;

  addLog(`Embed gestartet (apiBase=${apiBase}, game=${defaultGame}, refreshMs=${refreshMs}).`, false);
  loadLeaderboard();
  setInterval(loadLeaderboard, refreshMs);
})();
