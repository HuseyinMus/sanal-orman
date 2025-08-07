const map = document.getElementById("map");
const player = document.getElementById("player");

const mapWidth = 2000;
const mapHeight = 1000;
const playerRadius = 20;
const treeRadius = 30;
const speed = 2;

let playerX = 1000;
let playerY = 500;
const keys = {};

const trees = [
  { x: 900, y: 500, name: "Ali" },
  { x: 950, y: 550, name: "Zeynep" },
  { x: 1000, y: 600, name: "Efe" },
  { x: 1050, y: 550, name: "Merve" },
  { x: 1100, y: 500, name: "Ahmet" }
];

// DOM'a ağaçları ekle
trees.forEach(tree => {
  const treeDiv = document.createElement("div");
  treeDiv.className = "tree";
  treeDiv.style.left = `${tree.x - treeRadius}px`;
  treeDiv.style.top = `${tree.y - treeRadius}px`;

  const label = document.createElement("span");
  label.className = "tree-label";
  label.textContent = tree.name;

  treeDiv.appendChild(label);
  tree.element = treeDiv;
  tree.label = label;

  map.appendChild(treeDiv);
});

// Klavye kontrolleri
document.addEventListener("keydown", e => {
  keys[e.key.toLowerCase()] = true;
});
document.addEventListener("keyup", e => {
  keys[e.key.toLowerCase()] = false;
});

// Mobil buton desteği (opsiyonel)
document.querySelectorAll('#controls button')?.forEach(button => {
  const dir = button.getAttribute('data-dir');
  const keyMap = { up: "w", down: "s", left: "a", right: "d" };

  button.addEventListener("touchstart", e => {
    e.preventDefault();
    keys[keyMap[dir]] = true;
  });
  button.addEventListener("touchend", e => {
    e.preventDefault();
    keys[keyMap[dir]] = false;
  });
});

// Çarpışma kontrolü
function checkCollision(nextX, nextY) {
  for (const tree of trees) {
    const dx = tree.x - nextX;
    const dy = tree.y - nextY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    if (distance < playerRadius + treeRadius) {
      return true;
    }
  }
  return false;
}

// Kamera konumunu hesapla
function updateCamera() {
  const screenWidth = window.innerWidth;
  const screenHeight = window.innerHeight;

  let offsetX = screenWidth / 2 - playerX;
  let offsetY = screenHeight / 2 - playerY;

  // Harita dışına taşmayı engelle
  offsetX = Math.min(0, Math.max(screenWidth - mapWidth, offsetX));
  offsetY = Math.min(0, Math.max(screenHeight - mapHeight, offsetY));

  map.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
}

function update() {
  let nextX = playerX;
  let nextY = playerY;

  if (keys["w"] || keys["arrowup"]) nextY -= speed;
  if (keys["s"] || keys["arrowdown"]) nextY += speed;
  if (keys["a"] || keys["arrowleft"]) nextX -= speed;
  if (keys["d"] || keys["arrowright"]) nextX += speed;

  // Harita sınırları
  nextX = Math.max(playerRadius, Math.min(nextX, mapWidth - playerRadius));
  nextY = Math.max(playerRadius, Math.min(nextY, mapHeight - playerRadius));

  // Çarpışma yoksa hareket et
  if (!checkCollision(nextX, nextY)) {
    playerX = nextX;
    playerY = nextY;
  }

  // Oyuncuyu yerleştir
  player.style.left = `${playerX - playerRadius}px`;
  player.style.top = `${playerY - playerRadius}px`;

  // Kamera güncelle
  updateCamera();

  // Etiketleri kontrol et
  trees.forEach(tree => {
    const dx = tree.x - playerX;
    const dy = tree.y - playerY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    tree.label.style.display = distance < 60 ? "block" : "none";
  });

  requestAnimationFrame(update);
}

// Sayfa boyutu değişince kamera yeniden hesaplansın
window.addEventListener("resize", updateCamera);

update();
;




