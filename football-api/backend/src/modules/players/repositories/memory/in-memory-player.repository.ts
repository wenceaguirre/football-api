import { CreatePlayerDto } from '../../dto/createPlayer.dto';
import { Player } from '../../entities/player.entity';
import { FindAllOptions, IPlayerRepository } from '../../interfaces/player-repository.interface';

export class InMemoryPlayerRepository implements IPlayerRepository {

  async create(playerData: CreatePlayerDto): Promise<Player> {
    const newPlayer = new Player();
    return new Promise((resolve) => {
      newPlayer.id = Math.floor(Math.random() * 1000); // Simulate ID generation
      newPlayer.name = playerData.name;
      newPlayer.club = playerData.club;
      newPlayer.position = playerData.position;
      newPlayer.nationality = playerData.nationality;
      newPlayer.rating = playerData.rating;
      newPlayer.speed = playerData.speed;
      newPlayer.shooting = playerData.shooting;
      newPlayer.passing = playerData.passing;
      newPlayer.dribbling = playerData.dribbling;
      this.players.push(newPlayer);
      resolve(newPlayer);
    });
  }
  update(id: number, playerData: Partial<Player>): Promise<Player | undefined> {
    const playerIndex = this.players.findIndex((p) => p.id === id);
    if (playerIndex === -1) {
      return Promise.resolve(undefined);
    }

    const updatedPlayer = { ...this.players[playerIndex], ...playerData };
    this.players[playerIndex] = updatedPlayer;
    return Promise.resolve(updatedPlayer);
  }
  delete(id: number): Promise<void> {
    const playerIndex = this.players.findIndex((p) => p.id === id);
    if (playerIndex === -1) {
      return Promise.reject(new Error('Player not found'));
    }
    this.players.splice(playerIndex, 1);
    return Promise.resolve();
  }
  private players: Player[] = [];

  async findAll(opts: FindAllOptions): Promise<{ rows: Player[]; count: number }> {
    let filtered = [...this.players];

    const { name, club, position } = opts.filters ?? {};

    if (name) {
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(name.toLowerCase())
      );
    }
    if (club) {
      filtered = filtered.filter(p =>
        p.club?.toLowerCase().includes(club.toLowerCase())
      );
    }
    if (position) {
      filtered = filtered.filter(p =>
        p.position?.toLowerCase().includes(position.toLowerCase())
      );
    }

    const count = filtered.length;
    // paginación
    const start = opts.offset ?? 0;
    const end = opts.limit ? start + opts.limit : undefined;
    const rows = filtered.slice(start, end);

    return { rows, count };
}

  async findOneById(id: number): Promise<Player | undefined> {
    return Promise.resolve(this.players.find((p) => p.id === id));
  }
}
