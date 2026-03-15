import { Injectable } from '@nestjs/common';
import { ObjectLiteral, SelectQueryBuilder } from 'typeorm';
import { PagePaginationDto } from './dto/page-pagination.dto';
import { CursorPaginationDto } from './dto/cursor-pagination.dto';

@Injectable()
export class CommonService {
  constructor() {}

  usePagePagination<T extends ObjectLiteral>(qb: SelectQueryBuilder<T>, dto: PagePaginationDto) {
    const { take, page } = dto;

    if (take && page) {
      const skip = (page - 1) * take;

      qb.take(take);
      qb.skip(skip);
    }
  }

  useCursorPagination<T extends ObjectLiteral>(qb: SelectQueryBuilder<T>, dto: CursorPaginationDto) {
    const { id, order, take } = dto;

    if (id) {
      const direction = order === 'ASC' ? '>=' : '<=';

      /// order -> ASC : movie.id > :id
      /// :id
      qb.where(`${qb.alias}.id ${direction} :id`, { id });
    }

    qb.orderBy(`${qb.alias}.id`, order);
    qb.take(take);
  }
}
