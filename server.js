const express = require('express');
const socketIO = require('socket.io');
const path = require('path');

const PORT = process.env.PORT || 3000;

console.log('Initializing HTTP server...');

const server = express()
  .use((req, res) => res.sendFile(path.join(__dirname, 'index.html')) )
  .listen(PORT, () => console.log(`HTTP server is now listening on ${PORT}`));

const io = socketIO(server);

let socket = () => null;
let reset = () => null;
let setResetCallback = (callback) => reset = callback;

io.on('connection', (socket_) => {
  socket = socket_;
  console.log('A client has connected to the websocket');
  socket.on('disconnect', () => console.log('A client has disconnected form the websocket'));
  socket.on('reset', reset);
});

module.exports = {
  io,
  socket,
  setResetCallback,
};
