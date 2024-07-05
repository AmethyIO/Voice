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

    const players = this.players
      .filter(p => p.uuid !== player.uuid)
      .map(p => ({ pos: p.position, uuid: p.uuid, gpid: p.gpid, health: p.health }));

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
        players,
      ]
    );

    this.players.push(player);
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