const locBtn = document.getElementById("locBtn");
const mapBtn = document.getElementById("mapBtn");
const statusEl = document.getElementById("status");
const coordsEl = document.getElementById("coords");
const piecesEl = document.getElementById("pieces");
const boardEl = document.getElementById("board");
const canvas = document.getElementById("hiddenCanvas");
const ctx = canvas.getContext("2d");

const SIZE = 256;
const TILE = 64;
const OSM_TILE = 256;

let marker = null;
let piecesData = [];

const map = L.map("map").setView([52.2297, 21.0122], 15);

L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "&copy; OpenStreetMap contributors",
  crossOrigin: true
}).addTo(map);

if ("Notification" in window && Notification.permission === "default") {
  Notification.requestPermission();
}

locBtn.onclick = () => {
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;

      map.setView([lat, lng], 15);
      coordsEl.textContent = `Współrzędne: ${lat.toFixed(5)}, ${lng.toFixed(5)}`;
      statusEl.textContent = "Pobrano lokalizację";

      if (marker) marker.setLatLng([lat, lng]);
      else marker = L.marker([lat, lng]).addTo(map);
    },
    () => {
      statusEl.textContent = "Błąd lokalizacji";
    }
  );
};

mapBtn.onclick = async () => {
  statusEl.textContent = "Pobieranie mapy...";
  await buildMapImage();
  createPuzzle();
  statusEl.textContent = "Puzzle utworzone";
};

function project(lat, lng, zoom) {
  const sin = Math.sin(lat * Math.PI / 180);
  const scale = OSM_TILE * 2 ** zoom;

  return {
    x: ((lng + 180) / 360) * scale,
    y: (0.5 - Math.log((1 + sin) / (1 - sin)) / (4 * Math.PI)) * scale
  };
}

function normalizeTile(x, y, zoom) {
  const limit = 2 ** zoom;
  const nx = ((x % limit) + limit) % limit;
  if (y < 0 || y >= limit) return null;
  return { x: nx, y };
}

function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}

async function buildMapImage() {
  ctx.clearRect(0, 0, SIZE, SIZE);

  const center = map.getCenter();
  const zoom = map.getZoom();
  coordsEl.textContent = `Współrzędne: ${center.lat.toFixed(5)}, ${center.lng.toFixed(5)}`;

  const p = project(center.lat, center.lng, zoom);
  const left = p.x - SIZE / 2;
  const top = p.y - SIZE / 2;

  const startX = Math.floor(left / OSM_TILE);
  const startY = Math.floor(top / OSM_TILE);
  const endX = Math.floor((left + SIZE - 1) / OSM_TILE);
  const endY = Math.floor((top + SIZE - 1) / OSM_TILE);

  const jobs = [];

  for (let tx = startX; tx <= endX; tx++) {
    for (let ty = startY; ty <= endY; ty++) {
      const n = normalizeTile(tx, ty, zoom);
      if (!n) continue;

      const url = `https://tile.openstreetmap.org/${zoom}/${n.x}/${n.y}.png`;
      const dx = tx * OSM_TILE - left;
      const dy = ty * OSM_TILE - top;

      jobs.push(
        loadImage(url).then(img => {
          ctx.drawImage(img, dx, dy, OSM_TILE, OSM_TILE);
        })
      );
    }
  }

  await Promise.all(jobs);

  if (marker) drawMarker(center, zoom);
}

function drawMarker(center, zoom) {
  const markerPos = marker.getLatLng();
  const c = project(center.lat, center.lng, zoom);
  const m = project(markerPos.lat, markerPos.lng, zoom);

  const x = m.x - c.x + SIZE / 2;
  const y = m.y - c.y + SIZE / 2;

  ctx.fillStyle = "#1976d2";
  ctx.strokeStyle = "white";
  ctx.lineWidth = 2;

  ctx.beginPath();
  ctx.arc(x, y - 8, 8, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(x, y + 12);
  ctx.lineTo(x - 7, y - 2);
  ctx.lineTo(x + 7, y - 2);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
}

function createPuzzle() {
  piecesEl.innerHTML = "";
  boardEl.innerHTML = "";
  piecesData = [];

  const imageUrl = canvas.toDataURL("image/png");

  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 4; col++) {
      const id = row * 4 + col + 1;
      piecesData.push({ id, row, col, imageUrl });
    }
  }

  for (let i = 1; i <= 16; i++) {
    const slot = document.createElement("div");
    slot.className = "slot";
    slot.dataset.id = i;
    slot.ondragover = (e) => e.preventDefault();
    slot.ondrop = dropPiece;
    boardEl.appendChild(slot);
  }

  [...piecesData].sort(() => Math.random() - 0.5).forEach(piece => {
    const div = makePiece(piece);
    piecesEl.appendChild(div);
  });
}

function makePiece(piece) {
  const div = document.createElement("div");
  div.className = "tile";
  div.draggable = true;
  div.dataset.id = piece.id;

  div.style.backgroundImage = `url(${piece.imageUrl})`;
  div.style.backgroundSize = `${SIZE}px ${SIZE}px`;
  div.style.backgroundPosition = `-${piece.col * TILE}px -${piece.row * TILE}px`;

  div.ondragstart = (e) => e.dataTransfer.setData("id", piece.id);
  return div;
}

function dropPiece(e) {
  e.preventDefault();

  if (!e.target.classList.contains("slot")) return;

  const id = e.dataTransfer.getData("id");
  const tile = document.querySelector(`.tile[data-id="${id}"]`);
  if (!tile) return;

  if (e.target.firstChild) {
    piecesEl.appendChild(e.target.firstChild);
  }

  e.target.appendChild(tile);
  checkPuzzle();
}

function checkPuzzle() {
  let ok = 0;

  document.querySelectorAll(".slot").forEach(slot => {
    slot.classList.remove("correct");
    const tile = slot.querySelector(".tile");

    if (tile && tile.dataset.id === slot.dataset.id) {
      slot.classList.add("correct");
      ok++;
    }
  });

  console.debug(`Poprawnie ułożone: ${ok}/16`);

  if (ok === 16) {
    statusEl.textContent = "Brawo! Wszystkie puzzle są dobrze ułożone.";

    if ("Notification" in window && Notification.permission === "granted") {
      new Notification("Puzzle ukończone!", {
        body: "Wszystkie elementy są na swoim miejscu."
      });
    }
  }
}
