// Load sound effects
const clickSound = new Audio("click.mp3");
const winSound = new Audio("win.mp3");

const cells = document.querySelectorAll(".cell");
const statusText = document.getElementById("status");
const winCanvas = document.getElementById("win-line");
const winCtx = winCanvas.getContext("2d");
const gridCanvas = document.getElementById("grid");
const gridCtx = gridCanvas.getContext("2d");

let board = ["", "", "", "", "", "", "", "", ""];
let currentPlayer = "X";
let gameActive = true;

function drawGrid() {
  gridCtx.clearRect(0, 0, 300, 300);
  gridCtx.strokeStyle = "black";
  gridCtx.lineWidth = 4;

  gridCtx.beginPath();
  gridCtx.moveTo(100, 0);
  gridCtx.lineTo(100, 300);
  gridCtx.stroke();

  gridCtx.beginPath();
  gridCtx.moveTo(200, 0);
  gridCtx.lineTo(200, 300);
  gridCtx.stroke();

  gridCtx.beginPath();
  gridCtx.moveTo(0, 100);
  gridCtx.lineTo(300, 100);
  gridCtx.stroke();

  gridCtx.beginPath();
  gridCtx.moveTo(0, 200);
  gridCtx.lineTo(300, 200);
  gridCtx.stroke();
}

function getCellCenter(index) {
  const col = index % 3;
  const row = Math.floor(index / 3);
  return {
    x: col * 100 + 50,
    y: row * 100 + 50,
  };
}

function drawWinLine([a, b, c]) {
  const start = getCellCenter(a);
  const end = getCellCenter(c);
  let progress = 0;

  // Direction vector
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const length = Math.sqrt(dx * dx + dy * dy);
  const offset = 40;
  const unitX = dx / length;
  const unitY = dy / length;

  const extendedStart = {
    x: start.x - unitX * offset,
    y: start.y - unitY * offset,
  };
  const extendedEnd = {
    x: end.x + unitX * offset,
    y: end.y + unitY * offset,
  };

  // Play win sound once
  winSound.currentTime = 0;
  winSound.play();

  function animate() {
    if (progress > 1) return;
    winCtx.clearRect(0, 0, 300, 300);
    winCtx.beginPath();
    winCtx.moveTo(extendedStart.x, extendedStart.y);
    winCtx.lineTo(
      extendedStart.x + (extendedEnd.x - extendedStart.x) * progress,
      extendedStart.y + (extendedEnd.y - extendedStart.y) * progress
    );
    winCtx.strokeStyle = "black";
    winCtx.lineWidth = 4;
    winCtx.stroke();
    progress += 0.02;
    requestAnimationFrame(animate);
  }

  animate();
}

function checkWin() {
  const wins = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];

  for (let combo of wins) {
    const [a, b, c] = combo;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      drawWinLine(combo);
      return true;
    }
  }
  return false;
}

function handleClick(e) {
  const index = e.target.dataset.index;
  if (!gameActive || board[index]) return;

  board[index] = currentPlayer;
  e.target.textContent = currentPlayer;

  // Play click sound
  clickSound.currentTime = 0;
  clickSound.play();

  if (checkWin()) {
    statusText.textContent = `Player ${currentPlayer} wins!`;
    gameActive = false;
    return;
  }

  if (!board.includes("")) {
    statusText.textContent = "It's a draw!";
    gameActive = false;
    return;
  }

  currentPlayer = currentPlayer === "X" ? "O" : "X";
  statusText.textContent = `Player ${currentPlayer}'s turn`;
}

function resetGame() {
  board = ["", "", "", "", "", "", "", "", ""];
  currentPlayer = "X";
  gameActive = true;
  statusText.textContent = `Player ${currentPlayer}'s turn`;
  winCtx.clearRect(0, 0, 300, 300);
  cells.forEach((cell) => (cell.textContent = ""));
}

cells.forEach((cell) => cell.addEventListener("click", handleClick));
drawGrid();
