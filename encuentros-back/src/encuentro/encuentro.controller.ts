import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { EncuentroService } from './encuentro.service';
import { CreateEncuentroDto } from './dto/create-encuentro.dto';
import { UpdateEncuentroDto } from './dto/update-encuentro.dto';

@Controller('encuentro')
export class EncuentroController {
  constructor(private readonly encuentroService: EncuentroService) {}

  @Post()
  create(@Body() createEncuentroDto: CreateEncuentroDto) {
    return this.encuentroService.create(createEncuentroDto);
  }

  @Get()
  findAll(@Query('creador') creador?: string) {
    const id = creador ? +creador : undefined;
    return this.encuentroService.findAll(id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.encuentroService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateEncuentroDto: UpdateEncuentroDto) {
    return this.encuentroService.update(+id, updateEncuentroDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.encuentroService.remove(+id);
  }
}
