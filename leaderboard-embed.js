(function () {
  const root = document.getElementById("gs-leaderboard");
  const list = document.getElementById("gs-leaderboard-list");
  const status = document.getElementById("gs-status");

  if (!root || !list) {
    return;
  }

  const apiBase = (root.dataset.apiBase || "http://johannes1.local").replace(/\/+$/, "");
  const defaultGame = (root.dataset.game || "my-game").trim();

  const parsedLimit = Number(root.dataset.limit || "10");
  const limit = Number.isFinite(parsedLimit) && parsedLimit > 0 ? Math.floor(parsedLimit) : 10;

  const parsedRefreshMs = Number(root.dataset.refreshMs || "5000");
  const refreshMs = Number.isFinite(parsedRefreshMs) && parsedRefreshMs >= 1000 ? Math.floor(parsedRefreshMs) : 5000;

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
      const url = `${apiBase}/api/scores?game=${encodeURIComponent(defaultGame)}&limit=${encodeURIComponent(String(limit))}`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const scores = await response.json();
      renderLeaderboard(scores);
      setStatus("Leaderboard aktualisiert.", false);
    } catch (error) {
      setStatus("Leaderboard konnte nicht geladen werden.", true);
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
      game: selectedGame,
      score: numericScore,
    };

    const response = await fetch(`${apiBase}/api/scores`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const json = await response.json();

    if (!json || !json.success) {
      throw new Error("submit failed");
    }

    setStatus("Score erfolgreich gesendet.", false);
    await loadLeaderboard();

    return json;
  }

  window.submitGameScore = submitGameScore;

  loadLeaderboard();
  setInterval(loadLeaderboard, refreshMs);
})();
