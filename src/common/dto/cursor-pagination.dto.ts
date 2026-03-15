import { IsIn, IsInt, IsOptional, Min } from 'class-validator';

export class CursorPaginationDto {
  @IsInt()
  @IsOptional()
  id: number;

  @IsIn(['ASC', 'DESC'])
  @IsOptional()
  order: 'ASC' | 'DESC' = 'DESC';

  @IsInt()
  @IsOptional()
  @Min(1, { message: '최소 1개 이상 입력해야 합니다!' })
  take: number = 5;
}
