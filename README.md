# MediaPipe Recipes

Browser-based experiments built on [MediaPipe Tasks for Web](https://ai.google.dev/edge/mediapipe/solutions/guide) — hands, pose and face tracking wired up to games and interfaces. Everything runs on-device: no build step, no dependencies to install, no frame ever leaves the browser.

**Live: https://kaivalpatel6350.github.io/mediapipe-recipes/**

## Demos

| Demo | What it does | Tracker |
| --- | --- | --- |
| [Dojo Arcade](https://kaivalpatel6350.github.io/mediapipe-recipes/arcade/arcade.html) | Seven ways to be the controller in one shell — silhouette matching, stillness, air-drawn glyphs, rhythm, physics, face, joint angles | Pose · Hands · Face |
| [Charades vs AI](https://kaivalpatel6350.github.io/mediapipe-recipes/charades/charades.html) | You act it out; an LLM reads a written description of your movements and guesses out loud | Pose + LLM |
| [Space Dojo](https://kaivalpatel6350.github.io/mediapipe-recipes/kid-game/) | Punch the meteors, kick the probes, squat under the lasers. Full-body play for kids, with a keyboard puppet mode | Pose |
| [Hero Suit](https://kaivalpatel6350.github.io/mediapipe-recipes/hero-suits/hero-suit.html) | Pick a suit, then dance — the costume tracks your skeleton in real time | Pose |
| [Handwave](https://kaivalpatel6350.github.io/mediapipe-recipes/handwave/) | A multi-page site navigated with one hand: pinch-drag to scroll, open-palm flick to change pages, plus write-ups on tracking and tuning | Hands |
| [Gesture Deck](https://kaivalpatel6350.github.io/mediapipe-recipes/demo1/gesture-deck.html) | The original single-file prototype — swipe a slide deck with an open palm | Hands |

Ideas that aren't built yet live in [`ideas.txt`](./ideas.txt).

## Charades vs AI — bring your own key

Charades is the only demo that talks to anything outside your machine, and only if you want it to. It sends a *text* description of your movements ("both arms above the head; marching on the spot") to an OpenAI-compatible chat endpoint — never an image, never a video frame.

The picker offers providers that allow direct browser calls, so there is **no proxy to run**:

| Provider | Base URL | Get a key |
| --- | --- | --- |
| OpenRouter | `https://openrouter.ai/api/v1` | [openrouter.ai/keys](https://openrouter.ai/keys) |
| Groq | `https://api.groq.com/openai/v1` | [console.groq.com/keys](https://console.groq.com/keys) |
| Gemini | `https://generativelanguage.googleapis.com/v1beta/openai` | [aistudio.google.com/apikey](https://aistudio.google.com/apikey) |
| OpenAI | `https://api.openai.com/v1` | [platform.openai.com/api-keys](https://platform.openai.com/api-keys) |

Your key lives in the tab's memory only — it is never stored, logged or committed. No key? Press **Play without AI** for the built-in word packs.

Endpoints that don't send CORS headers (NVIDIA NIM, Anthropic, most self-hosted servers without CORS configured) cannot be called from a web page at all; pick one of the above or enable CORS on your own server.

### "The browser could not reach …"

All four providers above do allow browser calls, so if the request dies before it gets there the cause is usually local. In rough order of likelihood:

1. **An ad/tracker or privacy blocker** (uBlock Origin, Brave Shields, Little Snitch, some corporate AV) silently cancelling the request — allow this page and retry.
2. **A VPN or company network** that blocks AI endpoints.
3. **A typo in the Base URL** — it must include the version path, e.g. `https://api.openai.com/v1`, not `https://api.openai.com`.

The page probes the host when a request fails and tells you which of these it looks like. A wrong or expired key looks different — you'll get a clean `HTTP 401` instead.


## Running locally

Cameras require a secure context, so a plain `file://` double-click won't work — every demo detects that and falls back to keyboard mode. Serve the folder instead:

```bash
git clone https://github.com/kaivalpatel6350/mediapipe-recipes.git
cd mediapipe-recipes
python3 -m http.server 8000
# open http://localhost:8000
```

The first load of each demo pulls its model from a CDN, so give it a moment.

## Tips

- Good front lighting and a relatively plain background help a lot.
- For the full-body demos, stand a couple of metres back so your whole body is in frame.
- Every demo ships a keyboard fallback if you have no webcam or no room to move.

## Structure

```
index.html          landing page
arcade/             Dojo Arcade — multi-game collection
charades/           Charades vs AI
kid-game/           Space Dojo
hero-suits/         Hero Suit
handwave/           hand-navigated multi-page site (+ assets/)
demo1/              Gesture Deck prototype
ideas.txt           unbuilt concepts
```
