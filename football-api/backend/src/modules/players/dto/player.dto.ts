import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class PlayerDto {
  @ApiProperty()
  readonly id: number;

  @ApiProperty()
  readonly name: string;

  @ApiProperty()
  readonly club: string;

  @ApiProperty()
  readonly position: string;

  @ApiProperty()
  readonly nationality: string;

  @ApiProperty()
  readonly rating: number;

  @ApiProperty()
  readonly speed: number;

  @ApiProperty()
  readonly shooting: number;

  @ApiProperty()
  readonly dribbling: number;

  @ApiProperty()
  readonly passing: number;

  @ApiPropertyOptional({ description: 'URL de la cara del jugador', nullable: true })
  readonly playerFaceUrl: string | null;

  constructor(partial: Partial<PlayerDto>) {
    Object.assign(this, partial);
  }
}
