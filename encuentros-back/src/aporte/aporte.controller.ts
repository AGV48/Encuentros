import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { AporteService } from './aporte.service';
import { CreateAporteDto } from './dto/create-aporte.dto';
import { UpdateAporteDto } from './dto/update-aporte.dto';

@Controller('aporte')
export class AporteController {
  constructor(private readonly aporteService: AporteService) {}

  @Post()
  create(@Body() createAporteDto: CreateAporteDto) {
    return this.aporteService.create(createAporteDto);
  }

  @Get()
  findAll(
    @Query('encuentro') encuentroId?: string,
    @Query('bolsillo') bolsilloId?: string,
    @Query('usuario') usuarioId?: string,
  ) {
    if (encuentroId) {
      return this.aporteService.findByEncuentro(Number(encuentroId));
    }
    if (bolsilloId) {
      return this.aporteService.findByBolsillo(Number(bolsilloId));
    }
    if (usuarioId) {
      return this.aporteService.findByUsuario(Number(usuarioId));
    }
    return this.aporteService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.aporteService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAporteDto: UpdateAporteDto) {
    return this.aporteService.update(+id, updateAporteDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.aporteService.remove(+id);
  }
}
