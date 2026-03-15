import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';
import { Movie } from './entity/movie.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, DataSource } from 'typeorm';
import { MovieDetail } from './entity/movie-detail.entity';
import { Director } from 'src/director/entity/director.entity';
import { Genre } from 'src/genre/entities/genre.entity';
import { GetMoviesDto } from './dto/get-movies.dto';
import { CommonService } from '../common/common.service';

@Injectable()
export class MovieService {
  constructor(
    @InjectRepository(Movie)
    private readonly movieRepository: Repository<Movie>,
    private readonly dataSource: DataSource,
    private readonly commonService: CommonService,
  ) {}

  async findAll(dto: GetMoviesDto) {
    const { title } = dto;

    const qb = this.movieRepository
      .createQueryBuilder('movie')
      .leftJoinAndSelect('movie.director', 'director')
      .leftJoinAndSelect('movie.genres', 'genres');

    if (title) {
      qb.where('movie.title LIKE :title', { title: `%${title}%` });
    }

    // this.commonService.usePagePagination<Movie>(qb, dto);
    this.commonService.useCursorPagination(qb, dto);

    const movies = await qb.getMany();

    return { movies, count: movies.length };
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
    const qr = this.dataSource.createQueryRunner();

    const movie = await this.movieRepository.findOne({ where: { title } });
    if (movie) {
      throw new BadRequestException('이미 존재하는 영화입니다!');
    }

    // Transaction Start
    await qr.connect();
    await qr.startTransaction();

    try {
      const genres = await qr.manager.find(Genre, { where: { id: In(genreIds) } });
      if (genres.length !== genreIds.length) {
        throw new NotFoundException(`존재하지 않는 장르가 있습니다! ids => ${genreIds.map((id) => id).join(', ')}`);
      }

      const director = await qr.manager.findOneOrFail(Director, { where: { id: directorId } });
      if (!director) {
        throw new NotFoundException('존재하지 않는 ID의 감독입니다!');
      }

      const movieDetail = await qr.manager
        .createQueryBuilder()
        .insert()
        .into(MovieDetail)
        .values({ text: detail })
        .returning('*')
        .execute();

      const movieDetailId: number = movieDetail.raw[0].id;

      const movie = await qr.manager
        .createQueryBuilder()
        .insert()
        .into(Movie)
        .values({ title, detail: { id: movieDetailId }, director })
        .execute();

      const movieId = movie.identifiers[0].id;

      await qr.manager
        .createQueryBuilder()
        .relation(Movie, 'genres')
        .of(movieId)
        .add(genres.map((genre) => genre.id));

      // Transaction Success
      await qr.commitTransaction();

      return this.findOne(movieId);
    } catch (err) {
      // Transaction Fail
      await qr.rollbackTransaction();
      throw err;
    } finally {
      // Transaction Cleanup
      await qr.release();
    }
  }

  async update(id: number, dto: UpdateMovieDto) {
    const movie = await this.findOne(id);
    const { detail, genreIds, directorId, ...rest } = dto;
    const qr = this.dataSource.createQueryRunner();

    // Transaction Start
    await qr.connect();
    await qr.startTransaction();

    try {
      let newGenres: Genre[] | null = null;
      let newDirector: Director | null = null;

      if (genreIds && genreIds.length) {
        const genres = await qr.manager.find(Genre, {
          where: { id: In(genreIds) },
        });

        if (genres.length !== genreIds.length) {
          throw new NotFoundException(`존재하지 않는 장르가 있습니다! ids => ${genreIds.map((id) => id).join(', ')}`);
        }

        newGenres = genres;
      }

      if (directorId) {
        const director = await qr.manager.findOne(Director, {
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

      await qr.manager.createQueryBuilder().update(Movie).set(movieUpdateFields).where('id = :id', { id }).execute();

      if (detail) {
        await qr.manager
          .createQueryBuilder()
          .update(MovieDetail)
          .set({ text: detail })
          .where('id = :id', { id: movie.detail.id })
          .execute();
      }

      if (newGenres) {
        await qr.manager
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

      // Transaction Success
      await qr.commitTransaction();

      return this.movieRepository.findOne({
        where: { id },
        relations: ['detail', 'director', 'genres'],
      });
    } catch (err) {
      // Transaction Fail
      await qr.rollbackTransaction();
      throw err;
    } finally {
      // Transaction Cleanup
      await qr.release();
    }
  }

  async remove(id: number) {
    const movie = await this.findOne(id);
    const qr = this.dataSource.createQueryRunner();

    // Transaction Start
    qr.connect();
    qr.startTransaction();

    try {
      await Promise.all([
        qr.manager.createQueryBuilder().delete().from(Movie).where('id = :id', { id }).execute(),
        qr.manager.createQueryBuilder().delete().from(MovieDetail).where('id = :id', { id: movie.detail.id }).execute(),
      ]);

      // Transaction Success
      qr.commitTransaction();

      return id;
    } catch (err) {
      // Transaction Fail
      qr.rollbackTransaction();
      throw err;
    } finally {
      // Transaction Cleanup
      qr.release();
    }
  }
}
