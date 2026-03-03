import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';
import { Movie } from './entity/movie.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, Not, In } from 'typeorm';
import { MovieDetail } from './entity/movie-detail.entity';
import { Director } from 'src/director/entity/director.entity';
import { Genre } from 'src/genre/entities/genre.entity';

@Injectable()
export class MovieService {
  constructor(
    @InjectRepository(Movie)
    private readonly movieRepository: Repository<Movie>,
    @InjectRepository(MovieDetail)
    private readonly movieDetailRepository: Repository<MovieDetail>,
    @InjectRepository(Genre)
    private readonly genreRepository: Repository<Genre>,
    @InjectRepository(Director)
    private readonly directorRepository: Repository<Director>,
  ) {}

  async findAll(title?: string) {
    //// 나중에 title 필터 기능 추가하기
    if (!title) {
      return {
        type: 'no title',
        result: await Promise.all([
          this.movieRepository.find({ relations: ['detail', 'director'] }),
          this.movieRepository.count(),
        ]),
      };
    }

    return {
      type: 'include title',
      result: await this.movieRepository.findAndCount({
        relations: ['detail', 'director'],
        where: { title: Like(`%${title}%`) },
      }),
    };
  }

  async findOne(id: number) {
    const movie = await this.movieRepository.findOne({
      where: { id },
      relations: ['detail', 'director'],
    });

    if (!movie) {
      throw new NotFoundException('존재하지 않는 ID 값의 영화입니다!');
    }

    return movie;
  }

  async create(dto: CreateMovieDto) {
    const { detail, genreIds, directorId, ...rest } = dto;

    const genres = await this.genreRepository.find({
      where: { id: In(genreIds) },
    });

    if (genres.length !== genreIds.length) {
      throw new NotFoundException(`존재하지 않는 장르가 있습니다! ids => ${genreIds.map((id) => id).join(', ')}`);
    }

    const director = await this.directorRepository.findOne({
      where: { id: directorId },
    });

    if (!director) {
      throw new NotFoundException('존재하지 않는 ID의 감독입니다!');
    }

    const movie = await this.movieRepository.save({
      ...rest,
      detail: { text: detail },
      director,
      genres,
    });

    return movie;
  }

  async update(id: number, dto: UpdateMovieDto) {
    const movie = await this.findOne(id);
    const { detail, genreIds, directorId, ...rest } = dto;

    let newGenre: Genre[] | null = null;
    let newDirector: Director | null = null;

    if (genreIds && genreIds.length) {
      const genres = await this.genreRepository.find({
        where: { id: In(genreIds) },
      });

      if (genres.length !== genreIds.length) {
        throw new NotFoundException(`존재하지 않는 장르가 있습니다! ids => ${genreIds.map((id) => id).join(', ')}`);
      }

      newGenre = genres;
    }
    1;
    if (directorId) {
      const director = await this.directorRepository.findOne({
        where: { id: directorId },
      });

      if (!director) {
        throw new NotFoundException('존재하지 않는 ID의 감독입니다!');
      }

      newDirector = director;
    }

    const movieUpdateFields = {
      ...rest,
      ...(newGenre && { genre: newGenre }),
      ...(newDirector && { director: newDirector }),
    };

    await this.movieRepository.update({ id }, movieUpdateFields);

    if (detail) {
      await this.movieDetailRepository.update({ id: movie.detail.id }, { text: detail });
    }

    const newMovie = await this.movieRepository.findOne({
      where: { id },
      relations: ['detail', 'director'],
    });

    return newMovie;
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
