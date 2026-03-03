import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateGenreDto } from './dto/create-genre.dto';
import { UpdateGenreDto } from './dto/update-genre.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Genre } from './entities/genre.entity';
import { Repository } from 'typeorm';

@Injectable()
export class GenreService {
  constructor(
    @InjectRepository(Genre)
    private readonly genreRepository: Repository<Genre>,
  ) {}

  findAll() {
    return this.genreRepository.find();
  }

  async findOne(id: number) {
    const genre = await this.genreRepository.findOne({ where: { id } });

    if (!genre) {
      throw new NotFoundException('존재하지 않는 ID 값의 장르입니다!');
    }

    return genre;
  }

  create(dto: CreateGenreDto) {
    return this.genreRepository.save(dto);
  }

  async update(id: number, dto: UpdateGenreDto) {
    await this.findOne(id);
    await this.genreRepository.update({ id }, dto);
    return this.findOne(id);
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.genreRepository.delete(id);
    return id;
  }
}
