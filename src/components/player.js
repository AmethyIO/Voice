const uuid = require('uuid');
const { vaildPublic } = require('../utils');

class Player {
  socket = undefined;
  service = undefined;

  uuid = uuid.v7();
  gpid = 0;

  water = 0;
  health = 0;
  hunger = 0;
  temperature = 0;

  position = { x: 0, y: 0 };
  ingame = false;
  handshaked = false;
  currentRoom = undefined;

  _traceIntervals = [];

  constructor(socket, service, { gpid, health, position }) {
    this.socket = socket;
    this.service = service;

    this.gpid = gpid ?? 0;
    this.health = health ?? 0;
    this.position = position ?? { x: 0, y: 0 };

    this.socket.on('join', this._join.bind(this));
    this.socket.on('info', this._updateInfo.bind(this));
    this.socket.on('leave', this._leave.bind(this));
    this.socket.on('handshake', this._onHandshake.bind(this));
  }

  _traceGame() {
    if (!this.handshaked)
      return;

    this.socket.emit('update', 1);
  }

  _traceInfo() {
    if (!this.handshaked || !this.ingame) 
      return;

    this.socket.emit('update', 2);

    if (this.currentRoom) {
      const players = this.currentRoom.players
        .map(p => ({ pos: p.position, uuid: p.uuid, gpid: p.gpid, water: p.water, health: p.health, hunger: p.hunger, temperature: p.temperature }));

      if (players.length > 0) this.socket.emit('update.players', players);
    }
  }

  _join([roomName, gpid]) {
    if (!this.handshaked)
      return;

    this.gpid = gpid;
    this.ingame = true;

    const room = this.service.rooms.find(r => r.name === roomName)
    if (!room) return;

    if (this.currentRoom)
      this.currentRoom.removePlayer(this);

    this.currentRoom = room;
    this.currentRoom.addPlayer(this);

    console.log('Player', this.gpid, 'joined')
  }

  _leave() {
    if (!this.handshaked || this.currentRoom === undefined)
      return;

    this.currentRoom.removePlayer(this);
    this.currentRoom = undefined;

    console.log('Player', this.gpid, 'left');
    
    this.gpid = 0;
    this.ingame = false;
  }

  _updateInfo([x, y, health, hunger, temperature, water]) {
    if (!this.handshaked || !this.ingame)
      return;

    this.water = water;
    this.health = health;
    this.hunger = hunger;
    this.temperature = temperature;

    this.position.x = x;
    this.position.y = y;

    console.log('player info update', this.gpid);
  }

  _onHandshake(publicKey) {
    if (!vaildPublic(publicKey) && !this.handshaked) {
      this.socket.close();
      return;
    }

    this.handshaked = true;

    const rooms = [];
    const length = this.service.rooms.length;

    for (let i = 0; i < length; i++) {
      const room = this.service.rooms[i];
      if (room && room.available && !room.private) rooms.push([room.name, room.players.length]);
    }

    this._traceIntervals.push(setInterval(this._traceGame.bind(this), 1000));
    this._traceIntervals.push(setInterval(this._traceInfo.bind(this), 200));
    this.socket.emit('handshaked', [this.uuid, rooms]);

    console.log('Player handshaked', publicKey);
  }
}

module.exports = Player;