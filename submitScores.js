const API_URL = "http://localhost:5000/api/scores";

export async function submitScores(game, score, name) {
  if (typeof game !== "string" || game.trim() === "") {
    throw new TypeError("game must be a non-empty string");
  }

  if (typeof name !== "string" || name.trim() === "") {
    throw new TypeError("name must be a non-empty string");
  }

  let normalizedScore = score;
  if (typeof normalizedScore === "string" && normalizedScore.trim() !== "") {
    normalizedScore = Number(normalizedScore);
  }

  if (
    typeof normalizedScore !== "number" ||
    !Number.isFinite(normalizedScore)
  ) {
    throw new TypeError("score must be a finite number");
  }

  const response = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      playerName: name.trim(),
      game: game.trim(),
      score: normalizedScore,
    }),
  });

  if (!response.ok) {
    let message = "";
    try {
      const data = await response.json();
      if (data && typeof data.error === "string") {
        message = data.error;
      }
    } catch (err) {
      // Ignore JSON parse errors and fall back to a generic message.
    }

    throw new Error(message || `Request failed with status ${response.status}`);
  }

  return response.json();
}
