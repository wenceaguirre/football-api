import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsInt, Min, Max, IsOptional } from 'class-validator';

export class CreatePlayerDto {
    @ApiProperty()
    @IsString()
    name: string; // longName en el modelo

    @ApiProperty()
    @IsString()
    club: string; // clubName en el modelo

    @ApiProperty()
    @IsString()
    position: string; // playerPositions en el modelo

    @ApiProperty()
    @IsString()
    nationality: string; // nationalityName en el modelo

    @ApiProperty()
    @IsInt()
    @Min(0)
    @Max(100)
    rating: number; // overall en el modelo

    @ApiProperty()
    @IsInt()
    @Min(0)
    @Max(100)
    speed: number; // pace en el modelo

    @ApiProperty()
    @IsInt()
    @Min(0)
    @Max(100)
    shooting: number;

    @ApiProperty()
    @IsInt()
    @Min(0)
    @Max(100)
    dribbling: number;

    @ApiProperty()
    @IsInt()
    @Min(0)
    @Max(100)
    passing: number;

    @ApiProperty()
    @IsString()
    fifaVersion: string;

    @ApiProperty()
    @IsString()
    fifaUpdate: string;

    @ApiProperty({ required: false, default: 'default_face.png' })
    @IsString()
    @IsOptional()
    playerFaceUrl?: string;

    @ApiProperty({ required: false, default: 0 })
    @IsInt()
    @IsOptional()
    potential?: number;

    @ApiProperty({ required: false, default: 0 })
    @IsInt()
    @IsOptional()
    age?: number;
}