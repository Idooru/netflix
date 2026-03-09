import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { BaseTable } from '../../common/entity/base-table.entity';
import { Exclude } from 'class-transformer';

export enum Role {
  ADMIN = 'admin',
  PAID_USER = 'paidUser',
  USER = 'user',
}

@Entity()
export class User extends BaseTable {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column()
  @Exclude({ toClassOnly: true, toPlainOnly: true })
  password: string;

  @Column({ type: 'enum', enum: Role, default: Role.USER })
  role: Role;
}
