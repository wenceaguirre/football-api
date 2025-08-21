import * as XLSX from 'xlsx';
import { Inject, Injectable, BadRequestException } from '@nestjs/common';
import { IPlayerRepository } from './interfaces/player-repository.interface';
import { Player } from './entities/player.entity';
import { CreatePlayerDto } from './dto/createPlayer.dto';
import { PlayerQueryDto } from './dto/playerQuery.dto';
import { PlayerDto } from './dto/player.dto';
import { PlayerExportQueryDto } from './dto/player-export-query.dto';
import { InjectModel } from '@nestjs/sequelize';
import { PlayerModel } from './repositories/sequelize/player.model';
import { TimelineQueryDto } from './dto/timeline-query.dto';
import { NullishPropertiesOf } from 'sequelize/types/utils';
import { InjectConnection } from '@nestjs/sequelize';
import { Optional, InferCreationAttributes, Op, Sequelize } from 'sequelize';

type PlayerCreation = InferCreationAttributes<PlayerModel>;
type PlayerDefaults = Optional<
  PlayerCreation,
  NullishPropertiesOf<PlayerCreation>
>;
type ImportDefaults = {
  defaultFifaVersion?: string;
  defaultFifaUpdate?: string;
};

@Injectable()
export class PlayersService {
  constructor(
    @Inject('IPlayerRepository')
    private readonly playerRepository: IPlayerRepository,

    @InjectModel(PlayerModel)
    private readonly playerModel: typeof PlayerModel,

    @InjectConnection()
    private readonly sequelize: Sequelize,
  ) {}

  async createPlayer(playerData: CreatePlayerDto): Promise<Player> {
    return this.playerRepository.create(playerData);
  }
  async getAllPlayers(query: PlayerQueryDto) {
    const page = Math.max(parseInt(String(query.page ?? 1), 10) || 1, 1);
    const limit = Math.min(
      Math.max(parseInt(String(query.limit ?? 20), 10) || 20, 1),
      100,
    );
    const offset = (page - 1) * limit;

    
    const filters = {
      name: query.name?.trim() || undefined,
      club: query.club?.trim() || undefined,
      position: query.position?.trim() || undefined,
      search: (query as any).search?.trim() || undefined, 
    };

    const { rows, count } = await this.playerRepository.findAll({
      limit,
      offset,
      filters,
    });

    const items = rows.map((r) => new PlayerDto(r as any));

    return {
      items,
      total: count,
      page,
      limit,
      totalPages: Math.max(1, Math.ceil(count / limit)),
    };
  }

  async exportPlayers(
    query: PlayerExportQueryDto,
  ): Promise<{ buffer: Buffer; filename: string; mime: string }> {
    const limit = query.limit || undefined;
    const offset =
      query.page && query.limit ? (query.page - 1) * query.limit : 0;

    const { rows } = await this.playerRepository.findAll({
      limit,
      offset,
      filters: {
        name: query.name,
        club: query.club,
        position: query.position,
      },
    });

    // Convert to XLSX format
    const data = rows.map((p: Player) => ({
      id: p.id,
      name: p.name,
      club: p.club,
      position: p.position,
      nationality: p.nationality,
      rating: p.rating,
      speed: p.speed,
      shooting: p.shooting,
      passing: p.passing,
      dribbling: p.dribbling,
      playerFaceUrl: (p as any).playerFaceUrl,
    }));
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Players');

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const isXlsx = query.format === 'xlsx';
    const filename = isXlsx
      ? `players-${timestamp}.xlsx`
      : `players-${timestamp}.csv`;

    if (isXlsx) {
      const buf = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
      return {
        buffer: buf,
        filename: `players-${Date.now()}.xlsx`,
        mime: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      };
    } else {
      const csv = XLSX.utils.sheet_to_csv(worksheet);
      return {
        buffer: Buffer.from(csv, 'utf-8'),
        filename: `players-${Date.now()}.csv`,
        mime: 'text/csv; charset=utf-8',
      };
    }
  }

  async getTimeLine(id: number, q: TimelineQueryDto) {
    const base = await this.playerModel.findByPk(id);
    if (!base) return null;

    const skill = q.skill ?? 'dribbling';
    const from = q.from ?? 2015;
    const to = q.to ?? 2023;

    const versions = await this.playerModel.findAll({
      where: {
        longName: base.longName,
        fifaVersion: { [Op.between]: [String(from), String(to)] },
      },
      order: [['fifaVersion', 'ASC']],
      attributes: ['fifaVersion', skill as any],
    });

    const timeline = versions
      .map((v) => ({
        year: parseInt(String(v.fifaVersion), 10),
        value: (v.get(skill) as number | null) ?? null,
      }))
      .filter((x) => !isNaN(x.year) && x.value != null);

    return timeline;
  }

  async importPlayers(
    file: Express.Multer.File,
    defaults: ImportDefaults = {},
  ) {
    if (!file?.buffer?.length) {
      throw new BadRequestException('Archivo vacío o no enviado');
    }

    const wb = XLSX.read(file.buffer, { type: 'buffer', cellDates: false });
    const wsName = wb.SheetNames[0];
    if (!wsName) throw new BadRequestException('El archivo no contiene hojas');

    const ws = wb.Sheets[wsName];
    const rows = XLSX.utils.sheet_to_json<any>(ws, {
      defval: null,
      raw: false,
    });

    if (!Array.isArray(rows) || rows.length === 0) {
      throw new BadRequestException('No hay filas para importar');
    }

    // helpers

    const pick = <T = any>(obj: any, keys: string[]) => {
      for (const k of keys) {
        const v = obj[k];
        if (v != null && `${v}`.trim() !== '') return v;
      }
      return undefined;
    };
    const toStr = (v: any) => (v == null ? '' : String(v).trim());
    const toNum = (v: any) => {
      if (v == null || v === '') return null;
      const s = String(v).trim().replace(',', '.');
      const n = Number(s);
      return Number.isFinite(n) ? n : null;
    };
    const toISODate = (v: any) => {
      if (v == null || v === '') return null;
      const s = String(v).trim();
      if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
      const m = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(s);
      if (m) {
        const [_, d, mo, y] = m.map(Number);
        const dd = String(d).padStart(2, '0');
        const mm = String(mo).padStart(2, '0');
        return `${y}-${mm}-${dd}`;
      }
      if (/^\d+(\.\d+)?$/.test(s)) {
        const excelEpoch = new Date(Date.UTC(1899, 11, 30));
        const days = Number(s);
        const ms = days * 24 * 60 * 60 * 1000;
        const dt = new Date(excelEpoch.getTime() + ms);
        return dt.toISOString().slice(0, 10);
      }
      const dt = new Date(s);
      return isNaN(dt.getTime()) ? null : dt.toISOString().slice(0, 10);
    };

    function mustStr(
      v: string | null | undefined,
      field: string,
      row: number,
    ): string {
      const s = (v ?? '').toString().trim();
      if (!s) throw new BadRequestException(`Fila ${row}: falta ${field}`);
      return s;
    }

    const normalizeRow = (r: any, rowNumber: number): PlayerDefaults => {
      const name = toStr(pick(r, ['name', 'longName', 'player_name']));
      const position = toStr(pick(r, ['position', 'playerPositions', 'pos']));
      const fifaVersion =
        toStr(pick(r, ['fifaVersion', 'version'])) ||
        toStr(defaults.defaultFifaVersion);
      const fifaUpdate =
        toISODate(pick(r, ['fifaUpdate', 'update'])) ||
        defaults.defaultFifaUpdate ||
        null;

      const _name = mustStr(name, 'name', rowNumber);
      const _position = mustStr(position, 'position', rowNumber);
      const _fifaVersion = mustStr(fifaVersion, 'fifaVersion', rowNumber);
      const _fifaUpdate = mustStr(fifaUpdate, 'fifaUpdate', rowNumber);

      const rating = toNum(pick(r, ['rating', 'overall']));
      if (rating == null)
        throw new BadRequestException(`Fila ${rowNumber}: falta rating`);

      return {
        fifaVersion: _fifaVersion,
        fifaUpdate: _fifaUpdate,
        longName: _name,
        playerPositions: _position,

        playerFaceUrl:
          toStr(pick(r, ['playerFaceUrl', 'face', 'photo'])) ||
          'default_face.png',
        clubName: toStr(pick(r, ['club', 'clubName'])) || null,
        nationalityName:
          toStr(pick(r, ['nationality', 'nationalityName', 'country'])) || null,
        overall: rating ?? 0,
        pace: toNum(pick(r, ['speed', 'pace'])),
        shooting: toNum(pick(r, ['shooting'])),
        passing: toNum(pick(r, ['passing'])),
        dribbling: toNum(pick(r, ['dribbling'])),
      } as PlayerDefaults;
    };

    const byKey = new Map<string, any>();
    const baseRow = 2;
    rows.forEach((r, i) => {
      const name = toStr(r.name);
      const version = toStr(r.fifaVersion);
      const key = `${name}|||${version}`;
      if (!byKey.has(key)) byKey.set(key, { r, rowNumber: i + baseRow });
    });

    let inserted = 0,
      updated = 0;
    const errors: Array<{ row: number; error: string }> = [];

    await this.sequelize.transaction(async (trx) => {
      for (const { r, rowNumber } of byKey.values()) {
        try {
          const payload = normalizeRow(r, rowNumber); // ✅ tipo ok
          const [model, created] = await this.playerModel.findOrCreate({
            where: {
              longName: payload.longName!,
              fifaVersion: payload.fifaVersion!,
            }, // ✅ non-null aquí
            defaults: payload, // ✅ ahora coincide con InferCreationAttributes<PlayerModel>
            transaction: trx,
          });
          if (!created) {
            await model.update(payload, { transaction: trx });
            updated++;
          } else {
            inserted++;
          }
        } catch (e: any) {
          errors.push({
            row: rowNumber,
            error: e?.message ?? 'Error desconocido',
          });
        }
      }
    });

    return { inserted, updated, errorsCount: errors.length, errors };
  }

  getPlayerById(id: number): Promise<Player | undefined> {
    return this.playerRepository.findOneById(id);
  }

  updatePlayer(
    id: number,
    playerData: Partial<Player>,
  ): Promise<Player | undefined> {
    return this.playerRepository.update(id, playerData);
  }

  deletePlayer(id: number): Promise<void> {
    return this.playerRepository.delete(id);
  }
}
