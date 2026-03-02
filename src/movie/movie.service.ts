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

  async getManyMovies(title?: string) {
    //// 나중에 title 필터 기능 추가하기
    if (!title) {
      return {
        type: 'no title',
        result: await Promise.all([
          this.movieRepository.find(),
          this.movieRepository.count(),
        ]),
      };
    }

    return {
      type: 'include title',
      result: await this.movieRepository.findAndCount({
        where: { title: Like(`%${title}%`) },
      }),
    };
  }

  async getMovieById(id: number) {
    const movie = await this.movieRepository.findOne({ where: { id } });
    if (!movie) {
      throw new NotFoundException('존재하지 않는 ID 값의 영화입니다!');
    }
    return movie;
  }

  async createMovie(dto: CreateMovieDto) {
    const { title, genre, detail } = dto;

    const movieDetail = await this.movieDetailRepository.save({
      text: detail,
    });

    const movie = await this.movieRepository.save({
      title,
      genre,
      detail: movieDetail,
    });

    return movie;
  }

  async updateMovie(id: number, body: UpdateMovieDto) {
    await this.getMovieById(id);
    await this.movieRepository.update({ id }, body);
    return this.movieRepository.findOne({ where: { id } });
  }

  async deleteMovie(id: number) {
    await this.getMovieById(id);
    await this.movieRepository.delete({ id });
    return id;
  }
}
