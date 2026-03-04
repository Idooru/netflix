import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';
import { Movie } from './entity/movie.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
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
    const qb = this.movieRepository
      .createQueryBuilder('movie')
      .leftJoinAndSelect('movie.director', 'director')
      .leftJoinAndSelect('movie.genres', 'genres');

    if (title) {
      qb.where('movie.title LIKE :title', { title: `%${title}%` });
    }

    return qb.getManyAndCount();

    // 나중에 title 필터 기능 추가하기
    // if (!title) {
    //   return {
    //     type: 'no title',
    //     result: await Promise.all([
    //       this.movieRepository.find({ relations: ['director', 'genres'] }),
    //       this.movieRepository.count(),
    //     ]),
    //   };
    // }

    // return {
    //   type: 'include title',
    //   result: await this.movieRepository.findAndCount({
    //     relations: ['director', 'genres'],
    //     where: { title: Like(`%${title}%`) },
    //   }),
    // };
  }

  async findOne(id: number) {
    const movie = await this.movieRepository
      .createQueryBuilder('movie')
      .leftJoinAndSelect('movie.detail', 'detail')
      .leftJoinAndSelect('movie.director', 'director')
      .leftJoinAndSelect('movie.genres', 'genres')
      .where('movie.id = :id', { id })
      .getOne();

    if (!movie) {
      throw new NotFoundException('존재하지 않는 ID 값의 영화입니다!');
    }

    return movie;

    // const movie = await this.movieRepository.findOne({
    //   where: { id },
    //   relations: ['detail', 'director', 'genres'],
    // });

    // if (!movie) {
    //   throw new NotFoundException('존재하지 않는 ID 값의 영화입니다!');
    // }

    // return movie;
  }

  async create(dto: CreateMovieDto) {
    const { title, detail, genreIds, directorId } = dto;

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

    const movieDetail = await this.movieDetailRepository
      .createQueryBuilder()
      .insert()
      .into(MovieDetail)
      .values({ text: detail })
      .returning('*')
      .execute();

    const movieDetailId: number = movieDetail.raw[0].id;

    const movie = await this.movieRepository
      .createQueryBuilder()
      .insert()
      .into(Movie)
      .values({ title, detail: { id: movieDetailId }, director })
      .execute();

    const movieId = movie.identifiers[0].id;

    await this.movieRepository
      .createQueryBuilder()
      .relation(Movie, 'genres')
      .of(movieId)
      .add(genres.map((genre) => genre.id));

    return this.findOne(movieId);
  }

  async update(id: number, dto: UpdateMovieDto) {
    const movie = await this.findOne(id);
    const { detail, genreIds, directorId, ...rest } = dto;

    let newGenres: Genre[] | null = null;
    let newDirector: Director | null = null;

    if (genreIds && genreIds.length) {
      const genres = await this.genreRepository.find({
        where: { id: In(genreIds) },
      });

      if (genres.length !== genreIds.length) {
        throw new NotFoundException(`존재하지 않는 장르가 있습니다! ids => ${genreIds.map((id) => id).join(', ')}`);
      }

      newGenres = genres;
    }

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
      ...(newDirector && { director: newDirector }),
    };

    await this.movieRepository
      .createQueryBuilder()
      .update(Movie)
      .set(movieUpdateFields)
      .where('id = :id', { id })
      .execute();

    if (detail) {
      await this.movieDetailRepository
        .createQueryBuilder()
        .update(MovieDetail)
        .set({ text: detail })
        .where('id = :id', { id: movie.detail.id })
        .execute();
    }

    if (newGenres) {
      await this.movieRepository
        .createQueryBuilder()
        .relation(Movie, 'genres')
        .of(id)
        .addAndRemove(
          newGenres.map((genre) => genre.id),
          movie.genres.map((genre) => genre.id),
        );
    }

    // if (newMovie && newGenres) {
    //   newMovie.genres = newGenres;
    //   await this.movieRepository.save(newMovie);
    // }

    return this.movieRepository.findOne({
      where: { id },
      relations: ['detail', 'director', 'genres'],
    });
  }

  async remove(id: number) {
    const movie = await this.findOne(id);

    await Promise.all([
      this.movieRepository
        .createQueryBuilder()
        .delete()
        .from(Movie)
        .where('id = :id', {
          id,
        })
        .execute(),
      this.movieDetailRepository
        .createQueryBuilder()
        .delete()
        .from(MovieDetail)
        .where('id = :id', { id: movie.detail.id })
        .execute(),
    ]);

    return id;
  }
}
