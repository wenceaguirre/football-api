import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsIn, IsOptional, IsInt, Min, IsString } from "class-validator";
import { Type } from "class-transformer";

export class PlayerExportQueryDto {
    @ApiPropertyOptional({ enum: ['csv', 'xlsx'], default: 'csv' })
    @IsIn(['csv', 'xlsx'])
    format?: 'csv' | 'xlsx' = 'xlsx';

    @ApiPropertyOptional({ example: 'messi' })
    @IsOptional()
    @IsString()
    name?: string;

    @ApiPropertyOptional({ example: 'PSG' })
    @IsOptional()
    @IsString()
    club?: string;

    @ApiPropertyOptional({ example: 'FW' })
    @IsOptional()
    @IsString()
    position?: string;

    @ApiPropertyOptional({ example: 1 })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    page?: number;

    @ApiPropertyOptional({ example: 1000 })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    limit?: number;
}