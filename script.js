// 1. Connect to the Online Server
const socket = io(); 

// Load your sound effects
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
let mySymbol = ""; // Tells you if you are X or O

// --- ONLINE COMMUNICATION ---

// Receive your role from the server (X or O)
socket.on('assignPlayer', (symbol) => {
    mySymbol = symbol;
    statusText.textContent = `You are Player ${mySymbol}. Waiting for game...`;
});

// Receive a move from the server
socket.on('updateBoard', (data) => {
    board[data.index] = data.symbol;
    cells[data.index].textContent = data.symbol;
    currentPlayer = data.nextPlayer;
    
    clickSound.currentTime = 0;
    clickSound.play();

    if (checkWin()) {
        statusText.textContent = `Player ${data.symbol} wins!`;
        gameActive = false;
    } else if (!board.includes("")) {
        statusText.textContent = "It's a draw!";
        gameActive = false;
    } else {
        statusText.textContent = `Player ${currentPlayer}'s turn`;
    }
});

// Receive a reset command
socket.on('resetGame', () => {
    board = ["", "", "", "", "", "", "", "", ""];
    currentPlayer = "X";
    gameActive = true;
    statusText.textContent = `Player X's turn`;
    winCtx.clearRect(0, 0, 300, 300);
    cells.forEach((cell) => (cell.textContent = ""));
});

// --- GAME LOGIC ---

function handleClick(e) {
    const index = e.target.dataset.index;

    // ONLY allow click if:
    // 1. It is my turn
    // 2. The game is active
    // 3. The cell is empty
    if (mySymbol === currentPlayer && gameActive && board[index] === "") {
        // We tell the server we want to move. 
        // We don't update the board locally yet!
        socket.emit('makeMove', { index: index, symbol: mySymbol });
    }
}

function resetGame() {
    socket.emit('requestReset');
}

// (Keep your helper functions exactly the same)
function drawGrid() {
    gridCtx.clearRect(0, 0, 300, 300);
    gridCtx.strokeStyle = "black";
    gridCtx.lineWidth = 4;
    gridCtx.beginPath();
    gridCtx.moveTo(100, 0); gridCtx.lineTo(100, 300);
    gridCtx.moveTo(200, 0); gridCtx.lineTo(200, 300);
    gridCtx.moveTo(0, 100); gridCtx.lineTo(300, 100);
    gridCtx.moveTo(0, 200); gridCtx.lineTo(300, 200);
    gridCtx.stroke();
}

function getCellCenter(index) {
    const col = index % 3;
    const row = Math.floor(index / 3);
    return { x: col * 100 + 50, y: row * 100 + 50 };
}

function drawWinLine([a, b, c]) {
    const start = getCellCenter(a);
    const end = getCellCenter(c);
    let progress = 0;
    winSound.play();
    function animate() {
        if (progress > 1) return;
        winCtx.clearRect(0, 0, 300, 300);
        winCtx.beginPath();
        winCtx.moveTo(start.x, start.y);
        winCtx.lineTo(start.x + (end.x - start.x) * progress, start.y + (end.y - start.y) * progress);
        winCtx.strokeStyle = "red";
        winCtx.lineWidth = 5;
        winCtx.stroke();
        progress += 0.05;
        requestAnimationFrame(animate);
    }
    animate();
}

function checkWin() {
    const wins = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
    for (let combo of wins) {
        const [a, b, c] = combo;
        if (board[a] && board[a] === board[b] && board[a] === board[c]) {
            drawWinLine(combo);
            return true;
        }
    }
    return false;
}

cells.forEach((cell) => cell.addEventListener("click", handleClick));
drawGrid();
