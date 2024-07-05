class Room {
  name = undefined;
  players = [];
  private = false;
  available = true;

  constructor(name) {
    this.name = name;

    console.log('Room created', this.name);
  }

  addPlayer(player) {
    if (this.players.find(p => p.uuid === player.uuid))
      return false;

    this.players.push(player);

    const players = this.players
      .map(p => ({ pos: p.position, uuid: p.uuid, gpid: p.gpid, water: p.water, health: p.health, hunger: p.hunger, temperature: p.temperature  }));

    this.players.filter(p => p.uuid !== player.uuid).forEach(p => {
      p.socket.emit(
        'player.join',
        {
          pos: player.position,
          uuid: player.uuid,
          gpid: player.gpid,
          health: player.health
        }
      );
    });

    player.socket.emit(
      'joined',
      [
        this.name,
        players,
      ]
    );
    return true;
  }

  removePlayer(player) {
    const index = this.players.findIndex(p => p.uuid === player.uuid);
    if (index !== -1) {
      this.players.filter(p => p.uuid !== player.uuid).forEach(p => {
        p.socket.emit(
          'player.left',
          {
            uuid: player.uuid,
            gpid: player.gpid,
          }
        );
      });

      player.socket.emit('leave');

      this.players.splice(index, 1);
      return true;
    }
    return false;
  }
}

module.exports = Room;