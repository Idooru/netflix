import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  ClassSerializerInterceptor,
  ParseIntPipe,
} from '@nestjs/common';
import { DirectorService } from './director.service';
import { CreateDirectorDto } from './dto/create-director.dto';
import { UpdateDirectorDto } from './dto/update-director.dto';

@Controller('director')
@UseInterceptors(ClassSerializerInterceptor)
export class DirectorController {
  constructor(private readonly directorService: DirectorService) {}

  @Get()
  getDirectors() {
    return this.directorService.findAll();
  }

  @Get(':id')
  getDirector(@Param('id', ParseIntPipe) id: number) {
    return this.directorService.findOne(id);
  }

  @Post()
  postDirector(@Body() body: CreateDirectorDto) {
    return this.directorService.create(body);
  }

  @Patch(':id')
  patchDirector(@Param('id', ParseIntPipe) id: number, @Body() body: UpdateDirectorDto) {
    return this.directorService.update(id, body);
  }

  @Delete(':id')
  deleteDirector(@Param('id', ParseIntPipe) id: number) {
    return this.directorService.remove(id);
  }
}
