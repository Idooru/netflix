import {
  Equals,
  IsArray,
  IsBoolean,
  IsDate,
  IsDateString,
  IsDefined,
  IsEmpty,
  IsEnum,
  IsIn,
  IsInt,
  IsNegative,
  IsNotEmpty,
  IsNotIn,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  NotEquals,
} from 'class-validator';

enum MovieGenre {
  Fantasy = 'fantasy',
  Action = 'action',
}

export class UpdateMovieDto {
  @IsNotEmpty()
  @IsOptional()
  title?: string;

  @IsNotEmpty()
  @IsOptional()
  genre?: string;

  // null || undefined
  // @IsDefined()
  // @IsOptional()
  // @Equals('hello')
  // @NotEquals('hello')
  // null || undefined || ""
  // @IsEmpty()
  // @IsNotEmpty()
  // Array
  // @IsIn(['action', 'fantasy'])
  // @IsNotIn(['action', 'fantasy'])
  // test: string;

  // @IsEnum(MovieGenre)
  @IsDateString()
  test: string;
}
