import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  findAll() {
    return this.userRepository.find();
  }

  async findOne(id: number) {
    const user = await this.userRepository.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException('존재하지 않는 Id 값의 사용자입니다!');
    }

    return user;
  }

  create(dto: CreateUserDto) {
    return this.userRepository.save(dto);
  }

  async update(id: number, dto: UpdateUserDto) {
    await this.findOne(id);
    await this.userRepository.update({ id }, dto);
    return this.findOne(id);
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.userRepository.delete(id);
    return id;
  }
}
