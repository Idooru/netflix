import { IsInt, IsOptional, Min } from 'class-validator';

export class PagePaginationDto {
  @IsInt()
  @IsOptional()
  @Min(1, { message: '최소 1페이지 이상 입력해야 합니다!' })
  page: number = 1;

  @IsInt()
  @IsOptional()
  @Min(1, { message: '최소 1개 이상 입력해야 합니다!' })
  take: number = 5;
}
