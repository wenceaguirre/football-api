import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { PlayerModel } from './player.model';
import { FindAllOptions, IPlayerRepository } from '../../interfaces/player-repository.interface';
import { Player } from '../../entities/player.entity';
import { CreatePlayerDto } from '../../dto/createPlayer.dto';
import { CreationAttributes } from 'sequelize';
import { Op } from 'sequelize';


@Injectable()
export class SequelizePlayerRepository implements IPlayerRepository {
  constructor(
    @InjectModel(PlayerModel)
    private readonly playerModel: typeof PlayerModel
  ) {}

  /**
   * Creates a new player in the database.
   */
  async create(playerData: CreatePlayerDto): Promise<Player> {
    try {
      const model = await this.playerModel.create({
        fifaVersion: playerData.fifaVersion,
        fifaUpdate: playerData.fifaUpdate,
        playerFaceUrl: playerData.playerFaceUrl || 'default_face.png',
        longName: playerData.name,
        clubName: playerData.club || null,
        playerPositions: playerData.position || 'Unknown',
        nationalityName: playerData.nationality || null,
        overall: playerData.rating,
        pace: playerData.speed,
        shooting: playerData.shooting,
        passing: playerData.passing,
        dribbling: playerData.dribbling,
        // Valores por defecto para evitar errores de MySQL
        potential:  playerData.rating ?? 0,
        age: 20, // valor por defecto o incluirlo en el DTO
      } as CreationAttributes<PlayerModel>);

      return this.mapToEntity(model);
    } catch (error) {
      console.error('Error creating player:', error);
      throw new InternalServerErrorException('Failed to create player');
    }
  }

  /**
   * Updates an existing player.
   */
  async update(id: number, playerData: Partial<Player>): Promise<Player> {
    const playerModel = await this.playerModel.findByPk(id);
    if (!playerModel) {
      throw new NotFoundException(`Player with id ${id} not found`);
    }

    playerModel.set({
      longName: playerData.name ?? playerModel.longName,
      clubName: playerData.club ?? playerModel.clubName,
      playerPositions: playerData.position ?? playerModel.playerPositions,
      nationalityName: playerData.nationality ?? playerModel.nationalityName,
      overall: playerData.rating ?? playerModel.overall,
      pace: playerData.speed ?? playerModel.pace,
      shooting: playerData.shooting ?? playerModel.shooting,
      passing: playerData.passing ?? playerModel.passing,
      dribbling: playerData.dribbling ?? playerModel.dribbling,
    });

    await playerModel.save();
    return this.mapToEntity(playerModel);
  }

  /**
   * Deletes a player by ID.
   */
  async delete(id: number): Promise<void> {
    const deletedCount = await this.playerModel.destroy({ where: { id } });
    if (deletedCount === 0) {
      throw new NotFoundException(`Player with id ${id} not found`);
    }
  }

  /**
   * Retrieves all players.
   */
  async findAll(options: FindAllOptions): Promise<{ rows: Player[]; count: number }> {
    const { limit = 20, offset = 0, filters = {} } = options;

    // Build where clause safely
    const where: any = {};

    if (filters.name) {
      // Search on long_name with case-insensitive like
      where.longName = { [Op.like]: `%${filters.name}%` };
    }
    if (filters.club) {
      where.clubName = { [Op.like]: `%${filters.club}%` };
    }
    if (filters.position) {
      // player_positions is comma-separated string; search for substring
      where.playerPositions = { [Op.like]: `%${filters.position}%` };
    }

    const result = await this.playerModel.findAndCountAll({
      where,
      limit,
      offset,
      order: [['overall', 'DESC']], // default ordering
    });

    // Map models -> domain Player
    const rows = result.rows.map((m) => {
      const p = new Player();
      p.id = m.id;
      p.name = m.longName;
      p.club = m.clubName ?? 'Unknown Club';
      p.position = m.playerPositions?.split(',')[0].trim() ?? 'Unknown';
      p.nationality = m.nationalityName ?? 'Unknown';
      p.rating = m.overall;
      p.speed = m.pace ?? 0;
      p.shooting = m.shooting ?? 0;
      p.dribbling = m.dribbling ?? 0;
      p.passing = m.passing ?? 0;
      return p;
    });

    return { rows, count: result.count };
  }

  /**
   * Retrieves a player by ID.
   */
  async findOneById(id: number): Promise<Player> {
    const model = await this.playerModel.findByPk(id);
    if (!model) {
      throw new NotFoundException(`Player with id ${id} not found`);
    }
    return this.mapToEntity(model);
  }

  /**
   * Maps Sequelize model to domain entity.
   */
  private mapToEntity = (model: PlayerModel): Player => {
    const player = new Player();
    player.id = model.id;
    player.name = model.longName;
    player.club = model.clubName || 'Unknown Club';
    player.position = model.playerPositions?.split(',')[0].trim() ?? 'Unknown';
    player.nationality = model.nationalityName || 'Unknown Nationality';
    player.rating = model.overall;
    player.speed = model.pace ?? 0;
    player.shooting = model.shooting ?? 0;
    player.dribbling = model.dribbling ?? 0;
    player.passing = model.passing ?? 0;
    return player;
  };
}
