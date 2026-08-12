import { HandLandmarker, FilesetResolver } from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14";

/* ---------------- tuning ---------------- */
const PINCH_RATIO = 0.38;   // thumb-to-index distance / palm size
const SWIPE_SPEED = 1.15;   // normalized screen widths per second
const SCROLL_GAIN = 2600;   // px of scroll per unit of hand travel
const COOLDOWN    = 1100;   // ms lockout after a page change

const PAGES = ["index.html", "tracking.html", "tuning.html", "running.html"];
const here = PAGES.indexOf(location.pathname.split("/").pop() || "index.html");

/* ---------------- chrome ---------------- */
const hud = document.createElement("div");
hud.id = "hud";
hud.innerHTML = `
  <div id="stage">
    <video id="cam" playsinline muted></video>
    <canvas id="skeleton"></canvas>
    <button id="start">Turn on camera<small>Runs locally in your browser</small></button>
  </div>
  <div class="readout"><span id="dot"></span><span id="gesture">Idle</span></div>`;
document.body.appendChild(hud);

const video = hud.querySelector("#cam");
const cv = hud.querySelector("#skeleton");
const ctx = cv.getContext("2d");
const startBtn = hud.querySelector("#start");
const dotEl = hud.querySelector("#dot");
const gestureEl = hud.querySelector("#gesture");
const progress = document.getElementById("progress");

const scroller = document.scrollingElement || document.documentElement;
function updateProgress(){
  const max = scroller.scrollHeight - innerHeight;
  if (progress) progress.style.width = (max > 0 ? scroller.scrollTop / max * 100 : 0) + "%";
}
addEventListener("scroll", updateProgress, { passive: true });
updateProgress();

let leaving = false;
function goPage(dir){
  const next = here + dir;
  if (leaving || next < 0 || next >= PAGES.length) return false;
  leaving = true;
  sessionStorage.setItem("handwave", "on");
  sessionStorage.setItem("handwave-dir", String(dir));
  document.body.classList.add("leaving");
  setTimeout(() => { location.href = PAGES[next]; }, 220);
  return true;
}

addEventListener("keydown", e => {
  if (e.key === "ArrowRight") goPage(1);
  if (e.key === "ArrowLeft") goPage(-1);
});

// arriving from a backwards swipe? start at the bottom of the page
if (sessionStorage.getItem("handwave-dir") === "-1"){
  addEventListener("load", () => scroller.scrollTo(0, scroller.scrollHeight));
}
sessionStorage.removeItem("handwave-dir");

/* ---------------- landmark helpers ---------------- */
const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
const EDGES = [[0,1],[1,2],[2,3],[3,4],[0,5],[5,6],[6,7],[7,8],[5,9],[9,10],[10,11],[11,12],
               [9,13],[13,14],[14,15],[15,16],[13,17],[17,18],[18,19],[19,20],[0,17]];

function fingersUp(lm){
  let n = 0;
  [[8,6],[12,10],[16,14],[20,18]].forEach(([tip, pip]) => { if (lm[tip].y < lm[pip].y) n++; });
  if (Math.abs(lm[4].x - lm[17].x) > Math.abs(lm[3].x - lm[17].x)) n++;   // thumb splayed
  return n;
}

function draw(lm){
  cv.width = cv.clientWidth; cv.height = cv.clientHeight;
  if (!lm) return;
  const P = i => [lm[i].x * cv.width, lm[i].y * cv.height];
  ctx.strokeStyle = "rgba(124,107,255,.85)"; ctx.lineWidth = 2;
  ctx.beginPath();
  EDGES.forEach(([a, b]) => { ctx.moveTo(...P(a)); ctx.lineTo(...P(b)); });
  ctx.stroke();
  ctx.fillStyle = "#FFB020";
  lm.forEach((_, i) => { const [x, y] = P(i); ctx.beginPath(); ctx.arc(x, y, i === 4 || i === 8 ? 4 : 2.5, 0, 7); ctx.fill(); });
}

/* ---------------- camera + model ---------------- */
let landmarker, lastVideoTime = -1, lastT = 0;
let sx = null, sy = null, lastSwipe = 0, pinching = false;

async function begin(){
  startBtn.textContent = "Loading model…";
  try {
    const files = await FilesetResolver.forVisionTasks(
      "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm");
    landmarker = await HandLandmarker.createFromOptions(files, {
      baseOptions: {
        modelAssetPath: "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task",
        delegate: "GPU"
      },
      numHands: 1,
      runningMode: "VIDEO"
    });
    video.srcObject = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 } });
    await video.play();
    startBtn.remove();
    dotEl.classList.add("live");
    sessionStorage.setItem("handwave", "on");
    requestAnimationFrame(loop);
  } catch (err) {
    startBtn.innerHTML = "Camera unavailable<small>" + err.message + "</small>";
  }
}
startBtn.addEventListener("click", begin);
if (sessionStorage.getItem("handwave") === "on") begin();   // carry the session across pages

/* ---------------- detection loop ---------------- */
function loop(now){
  requestAnimationFrame(loop);
  if (video.currentTime === lastVideoTime) return;
  lastVideoTime = video.currentTime;

  const lm = landmarker.detectForVideo(video, now).landmarks[0];
  draw(lm);

  if (!lm){ gestureEl.textContent = "No hand"; sx = sy = null; pinching = false; lastT = now; return; }

  const x = 1 - lm[0].x, y = lm[0].y;                  // mirrored wrist
  const palm = dist(lm[0], lm[9]) || 1e-6;
  const pinch = dist(lm[4], lm[8]) / palm < PINCH_RATIO;
  const open = fingersUp(lm) >= 4;

  const a = 0.5, px = sx, py = sy;
  sx = px === null ? x : px + (x - px) * a;
  sy = py === null ? y : py + (y - py) * a;
  const dt = Math.max((now - lastT) / 1000, 1 / 120);
  const vx = px === null ? 0 : (sx - px) / dt;
  const dy = py === null ? 0 : sy - py;
  lastT = now;

  if (pinch){
    if (pinching){ scroller.scrollTop -= dy * SCROLL_GAIN; updateProgress(); }
    pinching = true;
    gestureEl.textContent = "Pinch — scrolling";
    return;
  }

  pinching = false;
  if (open && Math.abs(vx) > SWIPE_SPEED && now - lastSwipe > COOLDOWN){
    lastSwipe = now;
    const dir = vx > 0 ? 1 : -1;
    gestureEl.textContent = goPage(dir)
      ? (dir > 0 ? "Next page" : "Previous page")
      : "End of the deck";
  } else {
    gestureEl.textContent = open ? "Open palm" : "Tracking";
  }
}
