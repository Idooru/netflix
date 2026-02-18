import { Transform } from 'class-transformer';

export class Movie {
  id: number;
  title: string;
  @Transform(({ value }: { value: string }) => value.toUpperCase())
  genre: string;
}
