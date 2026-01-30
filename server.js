const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(__dirname));

let players = {}; 
let board = ["", "", "", "", "", "", "", "", ""];
let currentPlayer = "X";

io.on('connection', (socket) => {
    // Assign Roles
    if (Object.keys(players).length === 0) {
        players[socket.id] = "X";
        socket.emit('assignPlayer', "X");
    } else if (Object.keys(players).length === 1) {
        players[socket.id] = "O";
        socket.emit('assignPlayer', "O");
    } else {
        socket.emit('assignPlayer', "Spectator");
    }

    socket.on('makeMove', (data) => {
        if (data.symbol === currentPlayer && board[data.index] === "") {
            board[data.index] = data.symbol;
            currentPlayer = currentPlayer === "X" ? "O" : "X";
            io.emit('updateBoard', { index: data.index, symbol: data.symbol, nextPlayer: currentPlayer });
        }
    });

    socket.on('requestReset', () => {
        board = ["", "", "", "", "", "", "", "", ""];
        currentPlayer = "X";
        io.emit('resetGame');
    });

    socket.on('disconnect', () => { delete players[socket.id]; });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
