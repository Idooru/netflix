import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';
import { Movie } from './entity/movie.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';

@Injectable()
export class MovieService {
  constructor(
    @InjectRepository(Movie)
    private readonly repository: Repository<Movie>,
  ) {}

  async getManyMovies(title?: string) {
    //// 나중에 title 필터 기능 추가하기
    if (!title) {
      return {
        type: 'no title',
        result: await Promise.all([
          this.repository.find(),
          this.repository.count(),
        ]),
      };
    }

    return {
      type: 'include title',
      result: await this.repository.findAndCount({
        where: { title: Like(`%${title}%`) },
      }),
    };
  }

  async getMovieById(id: number) {
    const movie = await this.repository.findOne({ where: { id } });
    if (!movie) {
      throw new NotFoundException('존재하지 않는 ID 값의 영화입니다!');
    }
    return movie;
  }

  createMovie(body: CreateMovieDto) {
    return this.repository.save(body);
  }

  async updateMovie(id: number, body: UpdateMovieDto) {
    await this.getMovieById(id);
    await this.repository.update({ id }, body);
    return this.repository.findOne({ where: { id } });
  }

  async deleteMovie(id: number) {
    await this.getMovieById(id);
    await this.repository.delete({ id });
    return id;
  }
}
