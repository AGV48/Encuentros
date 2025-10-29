import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreatePresupuestoDto } from './dto/create-presupuesto.dto';
import { UpdatePresupuestoDto } from './dto/update-presupuesto.dto';
import { CreateItemPresupuestoDto } from './dto/create-item-presupuesto.dto';
import { Presupuesto } from './entities/presupuesto.entity';
import { ItemPresupuesto } from './entities/item-presupuesto.entity';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class PresupuestoService {
  constructor(
    @InjectRepository(Presupuesto)
    private readonly presupuestoRepository: Repository<Presupuesto>,
    @InjectRepository(ItemPresupuesto)
    private readonly itemPresupuestoRepository: Repository<ItemPresupuesto>,
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async create(
    createPresupuestoDto: CreatePresupuestoDto,
  ): Promise<Presupuesto> {
    const presupuesto = this.presupuestoRepository.create(createPresupuestoDto);
    return await this.presupuestoRepository.save(presupuesto);
  }

  async findAll(): Promise<Presupuesto[]> {
    return await this.presupuestoRepository.find({
      relations: ['encuentro', 'items'],
    });
  }

  async findOne(id: number): Promise<Presupuesto> {
    const presupuesto = await this.presupuestoRepository.findOne({
      where: { id },
      relations: ['encuentro', 'items'],
    });

    if (!presupuesto) {
      throw new NotFoundException(`Presupuesto con ID ${id} no encontrado`);
    }

    return presupuesto;
  }

  async findByEncuentro(idEncuentro: number): Promise<Presupuesto | null> {
    return await this.presupuestoRepository.findOne({
      where: { idEncuentro },
      relations: ['encuentro', 'items'],
    });
  }

  async update(
    id: number,
    updatePresupuestoDto: UpdatePresupuestoDto,
  ): Promise<Presupuesto> {
    const presupuesto = await this.findOne(id);
    Object.assign(presupuesto, updatePresupuestoDto);
    return await this.presupuestoRepository.save(presupuesto);
  }

  async remove(id: number): Promise<void> {
    const presupuesto = await this.findOne(id);
    await this.presupuestoRepository.remove(presupuesto);
  }

  async agregarItem(
    createItemDto: CreateItemPresupuestoDto,
  ): Promise<ItemPresupuesto> {
    // Llamar al procedimiento almacenado
    await this.dataSource.query(
      `BEGIN agregar_item_presupuesto(:p_id_presupuesto, :p_id_encuentro, :p_nombre_item, :p_monto_item); END;`,
      [
        createItemDto.idPresupuesto,
        createItemDto.idEncuentro,
        createItemDto.nombreItem,
        createItemDto.montoItem,
      ],
    );

    // Obtener el item recién creado
    const item = await this.itemPresupuestoRepository.findOne({
      where: {
        idPresupuesto: createItemDto.idPresupuesto,
        nombreItem: createItemDto.nombreItem,
      },
      order: { id: 'DESC' },
    });

    if (!item) {
      throw new NotFoundException('No se pudo crear el item');
    }

    return item;
  }

  async getItems(idPresupuesto: number): Promise<ItemPresupuesto[]> {
    return await this.itemPresupuestoRepository.find({
      where: { idPresupuesto },
      order: { id: 'ASC' },
    });
  }
}
