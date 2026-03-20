# Leaderboard Embed Anleitung

Diese Anleitung ist für dieses Repository optimiert und so formuliert, dass auch ein weiterer KI-Agent ohne zusätzliche Rückfragen neue Spiele anbinden kann.

## Projekt-Standard (verbindlich)

- API-Basis: `http://johannes1.local:5000`
- Kein QR-Code-Flow für Score-Übertragung verwenden
- Score-Upload immer über `window.submitGameScore(...)`
- Pro Spiel muss `data-game` eindeutig sein (z. B. `flappy`, `snake`, `pacman`, `doodle-jump`)

## KI-Schnellstart: Neues Spiel anbinden

Wenn ein neues Spiel hinzugefügt wird, diese Schritte in genau dieser Reihenfolge ausführen:

1. In der neuen Spiel-HTML rechts (oder unter dem Spiel bei Mobile) einen Leaderboard-Bereich einfügen.
2. Das Embed-Script mit `<script src="leaderboard-embed.js" defer></script>` einbinden.
3. Bei Game-Over den finalen Score einmalig über `window.submitGameScore(...)` senden.
4. Spielernamen (falls nicht vorhanden) per `prompt(...)` abfragen und in `localStorage` speichern.
5. Sicherstellen, dass pro Runde nur ein Submit passiert (Flag wie `didSubmitThisRun`).

## Standard-HTML-Snippet (direkt verwenden)

```html
<aside id="leaderboard-wrap" aria-label="Leaderboard">
  <p id="gs-status" role="status" aria-live="polite"></p>
  <section
    id="gs-leaderboard"
    data-api-base="http://johannes1.local:5000"
    data-game="my-game"
    data-limit="10"
    data-refresh-ms="5000"
  >
    <h2>Leaderboard</h2>
    <ol id="gs-leaderboard-list"></ol>
  </section>
</aside>

<script src="leaderboard-embed.js" defer></script>
```

Hinweise:
- `data-game` auf den echten Spielnamen setzen.
- Falls `leaderboard-embed.js` in einem Unterordner liegt, Script-Pfad anpassen.

## Minimal-CSS für gutes Layout

```css
#leaderboard-wrap{
  width:320px;
  max-width:38vw;
  background:linear-gradient(180deg,rgba(14,20,36,.96),rgba(6,12,24,.95));
  border:1px solid rgba(255,255,255,.14);
  border-radius:14px;
  padding:12px;
  box-shadow:0 10px 24px rgba(0,0,0,.28);
}
#gs-status{margin:0 0 10px;font-size:13px;opacity:.92;min-height:18px}
#gs-leaderboard h2{margin:0 0 10px;font-size:20px}
#gs-leaderboard-list{margin:0;padding-left:22px;display:flex;flex-direction:column;gap:8px}
#gs-leaderboard-list li{padding:8px 10px;border-radius:9px;background:rgba(255,255,255,.08)}

@media (max-width:980px){
  #leaderboard-wrap{width:min(520px,100%);max-width:none}
}
```

## Standard-JS für Score-Submit bei Game-Over

```html
<script>
let didSubmitThisRun = false;

async function submitFinalScore(score){
  if(typeof window.submitGameScore !== 'function' || score <= 0) return;

  const key = 'my_game_player_name';
  let playerName = localStorage.getItem(key) || '';
  if(!playerName){
    const input = prompt('Name für das Leaderboard eingeben:', '');
    if(input === null) return;
    playerName = input.trim();
    if(!playerName) return;
    localStorage.setItem(key, playerName);
  }

  try{
    await window.submitGameScore(playerName, score, 'my-game');
  }catch(_error){
    // Fehlerstatus erscheint automatisch in #gs-status
  }
}

function onGameOver(score){
  if(didSubmitThisRun) return;
  didSubmitThisRun = true;
  submitFinalScore(score);
}

function onRoundReset(){
  didSubmitThisRun = false;
}
</script>
```

Wichtig:
- `'my-game'` und `'my_game_player_name'` auf das jeweilige Spiel anpassen.
- `onRoundReset()` bei Neustart/Reset aufrufen.

## API-Vertrag (Backend)

Erwartete Endpunkte:
- `POST /api/scores` mit JSON `{ playerName, game, score }`
- `GET /api/scores?game=<name>&limit=<n>`

## Checkliste für KI-Agenten (Definition of Done)

- Leaderboard-Snippet ist in der Spielseite sichtbar eingebaut.
- `data-api-base` ist `http://johannes1.local:5000`.
- `data-game` ist korrekt und eindeutig.
- Script `leaderboard-embed.js` ist eingebunden.
- Score wird bei Game-Over genau einmal gesendet.
- Spielername wird persistiert (`localStorage`).
- Kein QR-Code-UI und keine QR-Code-Generierung im Spielcode.
