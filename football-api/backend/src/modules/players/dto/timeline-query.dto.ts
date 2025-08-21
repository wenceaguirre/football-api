import { IsIn, IsOptional, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class TimelineQueryDto {
  @IsOptional()
  @IsIn(['pace', 'shooting', 'passing', 'dribbling', 'defending', 'physic'])
  skill?: 'pace' | 'shooting' | 'passing' | 'dribbling' | 'defending' | 'physic';

  @IsOptional() @Type(() => Number) @IsInt() @Min(2015) @Max(2023)
  from?: number;

  @IsOptional() @Type(() => Number) @IsInt() @Min(2015) @Max(2023)
  to?: number;
}