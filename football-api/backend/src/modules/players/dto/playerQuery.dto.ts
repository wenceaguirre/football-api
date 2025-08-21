import { IsOptional, IsInt, Min, IsString } from "class-validator";
import { ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";

export class PlayerQueryDto {
    @ApiPropertyOptional({ example: 1 })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    page?: number = 1;

    @ApiPropertyOptional({ example: 20 })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    limit?: number = 20;

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
}