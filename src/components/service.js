const http = require('http');
const https = require('https');
const cors = require('cors');
const axios = require('axios');
const express = require('express');
const { ExpressPeerServer } = require('peer');
const Player = require('./player');
const Room = require('./room');

const app = express();
const server = http.createServer(app);
const io = require('socket.io')(server);

class Service {
  rooms = [];
  peerServer;

  async _setupRooms() {
    const agent = new https.Agent({  
      rejectUnauthorized: false
    });
    const list = await axios.default.get('https://45.56.98.4/list', {
      httpsAgent: agent,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36'
      }
    });

    if (list.data && Array.isArray(list.data)) {
      const length = list.data.length;

      for (let i = 0; i < length; i++) {
        const region = list.data[i];

        if (region) {
          const servers = region.l;
          const servers_length = servers.length;

          for (let j = 0; j < servers_length; j++) {
            const server = servers[j];

            if (server) {
              const [hostname, region] = server;
              const name = region + hostname;

              this.rooms.push(new Room(name));
            }
          }
        }
      }
    }
  }

  _setupSocket() {
    io.on('connection', socket => {
      let player = new Player(socket, this, {
        gpid: 0,
        health: 0,
        position: { x: 0, y: 0 }
      });

      socket.on('disconnect', () => {
        if (player) {
          if (typeof player.currentRoom !== 'undefined') {
            console.log('room disconnect', player.currentRoom);
          }

          player._leave();
          console.log('Player disconnected');
          player = undefined;
        }
      });
    });
  }

  _setupExpress() {
    app.use(cors());
    app.use(express.static('../public'));
    app.use('/realtime', this.peerServer);
  }

  _setupServer() {
    server.listen(3000, () => {
      console.log('Listening on', server.address().port);
    })
  }

  constructor() {
    this.peerServer = ExpressPeerServer({
      on(event, callback) {
        if (event === 'upgrade') {
          server.on('upgrade', (req, socket, head) => {
            if (!req.url.startsWith('/socket.io/'))
              callback(req, socket, head);
          })
        } else {
          server.on(...arguments);
        }
      }
    });

    this._setupRooms();
    this._setupSocket();
    this._setupExpress();
    this._setupServer();
  }
};

module.exports = Service;