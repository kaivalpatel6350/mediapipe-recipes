# MediaPipe Recipes

Browser-based experiments built on [MediaPipe Tasks for Web](https://ai.google.dev/edge/mediapipe/solutions/guide) — hands, pose and face tracking wired up to games and interfaces. Everything runs on-device: no build step, no dependencies to install, no frame ever leaves the browser.

**Live: https://kaivalpatel6350.github.io/mediapipe-recipes/**

## Demos

| Demo | What it does | Tracker |
| --- | --- | --- |
| [Dojo Arcade](https://kaivalpatel6350.github.io/mediapipe-recipes/arcade/arcade.html) | Seven ways to be the controller in one shell — silhouette matching, stillness, air-drawn glyphs, rhythm, physics, face, joint angles | Pose · Hands · Face |
| [Space Dojo](https://kaivalpatel6350.github.io/mediapipe-recipes/kid-game/) | Punch the meteors, kick the probes, squat under the lasers. Full-body play for kids, with a keyboard puppet mode | Pose |
| [Hero Suit](https://kaivalpatel6350.github.io/mediapipe-recipes/hero-suits/hero-suit.html) | Pick a suit, then dance — the costume tracks your skeleton in real time | Pose |
| [Handwave](https://kaivalpatel6350.github.io/mediapipe-recipes/handwave/) | A multi-page site navigated with one hand: pinch-drag to scroll, open-palm flick to change pages, plus write-ups on tracking and tuning | Hands |
| [Gesture Deck](https://kaivalpatel6350.github.io/mediapipe-recipes/demo1/gesture-deck.html) | The original single-file prototype — swipe a slide deck with an open palm | Hands |

Ideas that aren't built yet live in [`ideas.txt`](./ideas.txt).

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
kid-game/           Space Dojo
hero-suits/         Hero Suit
handwave/           hand-navigated multi-page site (+ assets/)
demo1/              Gesture Deck prototype
ideas.txt           unbuilt concepts
```
