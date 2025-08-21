import { Repository } from 'typeorm';
import { Player } from '../../entities/player.entity';
import { IPlayerRepository } from '../../interfaces/player-repository.interface';
import { PlayerDto } from './player.dto';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreatePlayerDto } from '../../dto/createPlayer.dto';
import { FindAllOptions } from '../../interfaces/player-repository.interface';
import { Like } from 'typeorm';
@Injectable()
export class TypeOrmPlayerRepository implements IPlayerRepository {
  constructor(
    @InjectRepository(PlayerDto)
    private readonly playerRepository: Repository<PlayerDto>,
  ) {}
  
  async create(playerData: CreatePlayerDto): Promise<Player> {
    const entity = this.playerRepository.create({
      longName: playerData.name,
      clubName: playerData.club,
      playerPositions: playerData.position,
      nationalityName: playerData.nationality,
      overall: playerData.rating,
      pace: playerData.speed,
      shooting: playerData.shooting,
      dribbling: playerData.dribbling,
      passing: playerData.passing,
    });
    const saved = await this.playerRepository.save(entity);
    return this.mapToEntity(saved);
  }


  async update(id: number, playerData: Partial<Player>): Promise<Player | undefined> {
    const existingPlayer = await this.playerRepository.findOne({ where: { id } });

    if (!existingPlayer) return undefined;

    const updated = Object.assign(existingPlayer, {
      longName: playerData.name,
      clubName: playerData.club,
      playerPositions: playerData.position,
      nationalityName: playerData.nationality,
      overall: playerData.rating,
      pace: playerData.speed,
      shooting: playerData.shooting,
      passing: playerData.passing,
      dribbling: playerData.dribbling,
    });

    const saved = await this.playerRepository.save(updated);
    return this.mapToEntity(saved);
  }

  async delete(id: number): Promise<void> {
    const player = await this.playerRepository.findOne({ where: { id } });
    if (!player) return;
    await this.playerRepository.remove(player);
  }

  async findAll(opts: FindAllOptions): Promise<{ rows: Player[]; count: number }> {
    const where: any = {};

    if (opts.filters?.name) {
      where.longName = Like(`%${opts.filters.name}%`);
    }
    if (opts.filters?.club) {
      where.clubName = Like(`%${opts.filters.club}%`);
    }
    if (opts.filters?.position) {
      where.playerPositions = Like(`%${opts.filters.position}%`);
    }

    const [entities, count] = await this.playerRepository.findAndCount({
      where,
      skip: opts.offset ?? 0,
      take: opts.limit ?? 10,
    });

    return {
      rows: entities.map((entity) => this.mapToEntity(entity)),
      count,
    };
  }

  async findOneById(id: number): Promise<Player | undefined> {
    const dto = await this.playerRepository.findOne({ where: { id } });
    if (dto === null) {
      return undefined;
    }

    const entity = this.mapToEntity(dto);

    return entity;
  }

  private mapToEntity(playerDto: PlayerDto): Player {
    const player = new Player();
    player.id = playerDto.id;
    player.name = playerDto.longName;
    player.club = playerDto.clubName || 'Unknown Club';
    const positions = playerDto.playerPositions
      ? playerDto.playerPositions.split(',')[0].trim()
      : 'Unknown Position';
    player.position = positions;
    player.nationality = playerDto.nationalityName || 'Unknown Nationality';
    player.rating = playerDto.overall;
    player.speed = playerDto.pace ?? 0; // Using nullish coalescing operator (??) for numeric defaults
    player.shooting = playerDto.shooting ?? 0;
    player.dribbling = playerDto.dribbling ?? 0;
    player.passing = playerDto.passing ?? 0;

    return player;
  }
}
