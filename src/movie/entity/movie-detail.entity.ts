import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Movie } from './movie.entity';

@Entity()
export class MovieDetail {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  text: string;

  @OneToOne(() => Movie, (movie) => movie.detail, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  @JoinColumn()
  movie: Movie;
}
