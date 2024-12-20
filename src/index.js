const Service = require("./components/service");

const service = new Service();

// const http = require('http');
// const express = require('express');
// const { ExpressPeerServer } = require('peer');

// const { v4: uuidv4 } = require('uuid');
// const Player = require('./components/player');

// // setup express, socket io, and peerjs
// const app = express();
// const server = http.createServer(app);
// const io = require('socket.io')(server);

// // peerjs's express server is garbage and hijacks ALL websocket upgrades regardless of route
// const peerjsWrapper = {on(event, callback) {
//   if (event === 'upgrade') {
//     server.on('upgrade', (req, socket, head) => {
//       if (!req.url.startsWith('/socket.io/'))
//         callback(req, socket, head);
//     })
//   } else {
//     server.on(...arguments);
//   }
// }};

// const peerServer = ExpressPeerServer(peerjsWrapper);

// // use peerjs with express
// app.use('/peer', peerServer);
// app.use('/public', express.static('public'));

// const throttle = (func, limit) => {
//   let lastFunc
//   let lastRan
//   return function() {
//     const context = this
//     const args = arguments
//     if (!lastRan) {
//       func.apply(context, args)
//       lastRan = Date.now()
//     } else {
//       clearTimeout(lastFunc)
//       lastFunc = setTimeout(function() {
//         if ((Date.now() - lastRan) >= limit) {
//           func.apply(context, args)
//           lastRan = Date.now()
//         }
//       }, limit - (Date.now() - lastRan))
//     }
//   }
// }

// // track which users are connected
// const users = [];

// // handle socket connection
// io.on('connection', socket => {
//   const id = uuidv4();
//   const pos = {x: 0, y: 0};
//   users.push({ id, socket, pos });
//   console.log('user connected', id);

//   const test = new Player();

//   console.log(test);

//   // tell user his or her id
//   socket.emit('id', id);

//   // tell the other users to connect to this user
//   socket.broadcast.emit('join', id, pos);
//   socket.emit('players', users
//     .filter(u => u.id !== id)
//     .map(u => ({id: u.id, pos: u.pos}))
//   );

//   const emitPos = throttle((x, y) => {
//     socket.broadcast.emit('pos', id, {x, y});
//   }, 25);

//   socket.on('pos', (x, y) => {
//     // ignore non-number input
//     if (typeof x !== 'number' || typeof y !== 'number') return;

//     // clamp pos
//     x = Math.max(Math.min(200, x), -200);
//     y = Math.max(Math.min(200, y), -200);
//     pos.x = x;
//     pos.y = y;

//     // emit the position, throttled
//     emitPos(x, y);
//   });

//   // user disconnected
//   socket.on('disconnect', () => {
//     console.log('user disconnected', id);
//     // let other users know to disconnect this client
//     socket.broadcast.emit('leave', id);

//     // remove the user from the users list
//     const index = users.findIndex(u => u.id === id);
//     if (index !== -1) {
//       users.splice(index, 1);
//     }
//   });
// });

// peerServer.on('connection', peer => {
//   console.log('peer connected', peer.id);
// });

// peerServer.on('disconnect', peer => {
//   console.log('peer disconnected', peer.id);
// });

// server.listen(3000);