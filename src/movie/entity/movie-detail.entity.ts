import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Movie } from './movie.entity';
import { BaseTable } from './base-table.entity';

@Entity()
export class MovieDetail {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  detail: string;

  @OneToOne(() => Movie, (movie) => movie.detail)
  @JoinColumn()
  movie: Movie;
}
