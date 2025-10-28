import { IsNotEmpty, IsNumber, IsOptional, Min } from 'class-validator';

export class CreateAporteDto {
  @IsOptional()
  @IsNumber()
  idBolsillo?: number;

  @IsNotEmpty()
  @IsNumber()
  idEncuentro: number;

  @IsOptional()
  @IsNumber()
  idUsuario?: number;

  @IsNotEmpty()
  @IsNumber()
  @Min(0.01)
  monto: number;
}
