import { CreatePlayerDto } from '../dto/createPlayer.dto';
import { Player } from '../entities/player.entity';
export type FindAllOptions = {
  limit?: number;
  offset?: number;
  filters?: {name?: string; club?: string; position?: string};
};

export interface IPlayerRepository {
  create(playerData: CreatePlayerDto): Promise<Player>;
  findAll(opts: FindAllOptions): Promise<{ rows: Player[]; count: number }>;
  findOneById(id: number): Promise<Player | undefined>;
  update(id: number, playerData: Partial<Player>): Promise<Player | undefined>;
  delete(id: number): Promise<void>;
}
