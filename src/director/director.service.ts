import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateDirectorDto } from './dto/create-director.dto';
import { UpdateDirectorDto } from './dto/update-director.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Director } from './entity/director.entity';
import { Repository } from 'typeorm';

@Injectable()
export class DirectorService {
  constructor(
    @InjectRepository(Director)
    private readonly directorRepository: Repository<Director>,
  ) {}

  findAll() {
    return this.directorRepository.find({ relations: ['movies'] });
  }

  async findOne(id: number) {
    const director = await this.directorRepository.findOne({
      where: { id },
      relations: ['movies'],
    });

    if (!director) {
      throw new NotFoundException('존재하지 않는 ID 값의 감독입니다!');
    }

    return director;
  }

  create(dto: CreateDirectorDto) {
    return this.directorRepository.save(dto);
  }

  async update(id: number, dto: UpdateDirectorDto) {
    await this.findOne(id);
    await this.directorRepository.update({ id }, dto);
    return this.findOne(id);
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.directorRepository.delete(id);
    return id;
  }
}
