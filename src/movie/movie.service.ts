import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';
import { Movie } from './entity/movie.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { MovieDetail } from './entity/movie-detail.entity';

@Injectable()
export class MovieService {
  constructor(
    @InjectRepository(Movie)
    private readonly movieRepository: Repository<Movie>,
    @InjectRepository(MovieDetail)
    private readonly movieDetailRepository: Repository<MovieDetail>,
  ) {}

  async findAll(title?: string) {
    //// 나중에 title 필터 기능 추가하기
    if (!title) {
      return {
        type: 'no title',
        result: await Promise.all([
          this.movieRepository.find({ relations: ['detail'] }),
          this.movieRepository.count(),
        ]),
      };
    }

    return {
      type: 'include title',
      result: await this.movieRepository.findAndCount({
        relations: ['detail'],
        where: { title: Like(`%${title}%`) },
      }),
    };
  }

  async findOne(id: number) {
    const movie = await this.movieRepository.findOne({
      where: { id },
      relations: ['detail'],
    });

    if (!movie) {
      throw new NotFoundException('존재하지 않는 ID 값의 영화입니다!');
    }

    return movie;
  }

  async create(dto: CreateMovieDto) {
    const { detail, ...rest } = dto;

    const movie = await this.movieRepository.save({
      ...rest,
      detail: { text: detail },
    });

    return movie;
  }

  async update(id: number, dto: UpdateMovieDto) {
    const movie = await this.findOne(id);
    const { detail, ...rest } = dto;

    await this.movieRepository.update({ id }, rest);

    if (detail) {
      await this.movieDetailRepository.update(
        { id: movie.detail.id },
        { text: detail },
      );
    }

    return this.findOne(id);
  }

  async remove(id: number) {
    const movie = await this.findOne(id);

    await Promise.all([
      this.movieRepository.delete({ id }),
      this.movieDetailRepository.delete({ id: movie.detail.id }),
    ]);

    return id;
  }
}
