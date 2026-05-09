# Game Score Leaderboard Proof-of-Concept

This is a **proof-of-concept project** that demonstrates a static frontend hosted on GitHub Pages interacting with a backend API to store and display player scores for multiple games.

---

## Features

- **Game Website**: Submit player scores via a simple form.
- **Viewer / Leaderboard Website**: View top 10 scores per game, or overall top 10 across all games, with auto-refresh.
- **Backend API**: Node.js + Express server with SQLite database.
- **Database**: SQLite stores player names, game names, scores, and timestamps.
- **Frontend**: Static HTML, CSS, and JavaScript. Works locally or can be hosted on GitHub Pages.

---

## Project Structure

project-root/
│
├── backend/
│ ├── server.js # Node.js + Express + SQLite
│ ├── scores.db # SQLite database (auto-created)
│ ├── package.json
│ └── node_modules/
│
├── frontend/
│ ├── game/
│ │ ├── index.html
│ │ └── game.js
│ │
│ └── viewer/
│ ├── index.html
│ ├── viewer.js
│ └── style.css
│
├── submitScores.js # Reusable client helper to post scores
│
└── README.md


---

## Tech Stack

- **Frontend**: HTML, CSS, Vanilla JavaScript  
- **Backend**: Node.js, Express  
- **Database**: SQLite (`better-sqlite3`)  
- **Hosting**: GitHub Pages (frontend only)

---

## Getting Started (Local Development)

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd project-root/backend

2. Install backend dependencies

npm install

3. Start the backend server

node server.js

    Backend API will run at: http://localhost:5000

    Database scores.db will be created automatically if it doesn't exist.

4. Open frontend websites

    Game website: frontend/game/index.html

    Viewer / Leaderboard website: frontend/viewer/index.html

    Note: Frontend uses http://localhost:5000 as API URL for dev/testing.

Reusable Client Helper (submitScores.js)

Use submitScores.js to post scores from any site. It validates inputs and sends a POST to the backend.

Note: If you import submitScores.js with <script type="module"> from a local file (file://), some browsers will block the module import. To avoid that, either:
- run a local web server (recommended), or
- inline the submitScores helper directly in the HTML file you are opening.

Example (ES module):

<script type="module">
  import { submitScores } from "./submitScores.js";

  // submitScores(game, score, name)
  await submitScores("Snake", 123, "Chris");
</script>

To change the backend URL, edit the API_URL constant inside submitScores.js.

API Endpoints
POST /api/scores

Add a player score.

Request body (JSON):

{
  "playerName": "Chris",
  "game": "Snake",
  "score": 123
}

Response:

{
  "success": true
}

GET /api/scores

Retrieve scores, optionally filtered by game.

Query parameters:

    game (optional): Filter by game name.

    limit (optional): Maximum number of results (default 50).

Response:

[
  {
    "player_name": "Chris",
    "game": "Snake",
    "score": 123,
    "created_at": "2026-01-23T12:34:56Z"
  }
]

Future Improvements

    Host backend publicly (Cloudflare Tunnel / domain) for GitHub Pages frontend.

    Add authentication for secure score submissions.

    Enhance leaderboard UI with badges for top 3 ranks.

    Add multiple games or different game modes.

    Deploy backend to Raspberry Pi for local network testing.

License

This project is for educational / proof-of-concept purposes.