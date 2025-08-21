import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Put,
  Query,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { PlayersService } from './players.service';
import { PlayerQueryDto } from './dto/playerQuery.dto';
import { Response } from 'express';
import { PlayerExportQueryDto } from './dto/player-export-query.dto';
import { PlayerDto } from './dto/player.dto';
import { UpdatePlayerDto } from './dto/updatePlayer.dto';
import { CreatePlayerDto } from './dto/createPlayer.dto';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiTags,
  ApiProduces,
  ApiUnauthorizedResponse,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { Express } from 'express';
import { TimelineQueryDto } from './dto/timeline-query.dto';
import { memoryStorage } from 'multer';

@ApiTags('Players')
@ApiBearerAuth()
@ApiUnauthorizedResponse({ description: 'Unauthorized' })
@UseGuards(JwtAuthGuard)
@Controller('api/players')
export class PlayersController {
  constructor(private readonly playersService: PlayersService) {}

  //Listar todos los jugadores
  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ description: 'List of players' })
  async getAllPlayers(@Query() query: PlayerQueryDto) {
    const result = await this.playersService.getAllPlayers(query);
    return result;
  }  

  @Get('export')
  @HttpCode(HttpStatus.OK)
  @ApiProduces(
    'text/csv',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  )
  @ApiOkResponse({ description: 'Export players data as CSV/XLSX' })
  async export(
    @Query() query: PlayerExportQueryDto,
    @Res() res: Response,
  ): Promise<void> {
    const { buffer, filename, mime } =
      await this.playersService.exportPlayers(query);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Type', mime);
    res.send(buffer);
  }

  //Importar un jugador
  @Post('import')
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
      fileFilter: (_req, file, cb) => {
        const allowedMimes = new Set([
          'text/csv',
          'application/csv',
          'application/vnd.ms-excel',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'application/octet-stream',
        ]);
        const okMime = allowedMimes.has(file.mimetype);
        const okExt = /\.(csv|xlsx?)$/i.test(file.originalname || '');
        if (!okMime && !okExt) {
          return cb(
            new BadRequestException('Tipo de archivo no permitido (CSV/XLSX)'),
            false,
          );
        }
        cb(null, true);
      },
    }),
  )
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
      },
      required: ['file'],
    },
  })
  @ApiQuery({
    name: 'defaultFifaVersion',
    required: false,
    description: 'Default si el CSV no trae fifaVersion',
  })
  @ApiQuery({
    name: 'defaultFifaUpdate',
    required: false,
    description: 'YYYY-MM-DD si el CSV no trae fifaUpdate',
  })
  @ApiCreatedResponse({
    description: 'Resultado del import (insertados/actualizados/errores)',
  })
  async importCsv(
    @UploadedFile() file: Express.Multer.File,
    @Query('defaultFifaVersion') defaultFifaVersion?: string,
    @Query('defaultFifaUpdate') defaultFifaUpdate?: string,
  ) {
    if (!file?.buffer?.length) {
      throw new BadRequestException('Archivo vacío o no enviado');
    }

    // pasa defaults al service (ya preparaste importPlayers para aceptarlos)
    return this.playersService.importPlayers(file, {
      defaultFifaVersion,
      defaultFifaUpdate,
    });
  }

  //Obtener un jugador por ID y actualizarlo
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: PlayerDto })
  @ApiBadRequestResponse({ description: 'Invalid player ID' })
  async getPlayerById(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<PlayerDto> {
    const player = await this.playersService.getPlayerById(id);
    if (!player) {
      throw new NotFoundException(`Player with ID ${id} not found.`);
    }

    return new PlayerDto(player);
  }

  // Crear un jugador
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiCreatedResponse({ type: PlayerDto })
  @ApiBadRequestResponse({ description: 'Validation failed' })
  async createPlayer(@Body() playerData: CreatePlayerDto): Promise<PlayerDto> {
    const newPlayer = await this.playersService.createPlayer(playerData);
    return new PlayerDto(newPlayer);
  }

  // Editar un jugador por ID
  @Put(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: PlayerDto })
  @ApiBadRequestResponse({ description: 'Validation failed' })
  async updatePlayer(
    @Param('id', ParseIntPipe) id: number,
    @Body() playerData: UpdatePlayerDto,
  ): Promise<PlayerDto> {
    const updatedPlayer = await this.playersService.updatePlayer(
      id,
      playerData,
    );
    if (!updatedPlayer) {
      throw new NotFoundException(`Player with ID ${id} not found.`);
    }
    return new PlayerDto(updatedPlayer);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: PlayerDto })
  @ApiBadRequestResponse({ description: 'Validation failed' })
  async patchPlayer(
    @Param('id', ParseIntPipe) id: number,
    @Body() playerData: UpdatePlayerDto,
  ): Promise<PlayerDto> {
    const updated = await this.playersService.updatePlayer(id, playerData);
    if (!updated)
      throw new NotFoundException(`Player with ID ${id} not found.`);
    return new PlayerDto(updated);
  }

  @Patch('ping/:id')
  ping(@Param('id', ParseIntPipe) id: number) {
    return { ok: true, id };
  }

  // Eliminar un jugador por ID
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deletePlayer(@Param('id', ParseIntPipe) id: number): Promise<void> {
    const player = await this.playersService.getPlayerById(id);
    if (!player) {
      throw new NotFoundException(`Player with ID ${id} not found.`);
    }
    await this.playersService.deletePlayer(id);
  }

  @Get(':id/timeline')
  async timeline(
    @Param('id', ParseIntPipe) id: number,
    @Query() q: TimelineQueryDto,
  ) {
    const data = await this.playersService.getTimeLine(id, q);
    if (!data) throw new NotFoundException(`Player with ID ${id} not found`);
    return data;
  }
}
