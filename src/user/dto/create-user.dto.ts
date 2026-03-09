import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { Role } from '../entities/user.entity';

export class CreateUserDto {
  @IsNotEmpty()
  @IsString()
  email: string;

  @IsNotEmpty()
  @IsString()
  password: string;

  @IsNotEmpty()
  @IsEnum(Role)
  role: Role;
}
