import { ViewEntity, ViewColumn } from 'typeorm';

@ViewEntity({
  name: 'V_ENCUENTRO_RESUMEN',
  expression: `
    SELECT
      e.id_encuentro,
      e.titulo,
      e.lugar,
      e.fecha,
      NVL(p.id_presupuesto, NULL) AS id_presupuesto,
      NVL(p.presupuesto_total, 0) AS presupuesto_total,
      NVL(b.id_bolsillo, NULL) AS id_bolsillo,
      NVL(b.nombre, 'SIN_BOLSILLO') AS nombre_bolsillo,
      NVL(b.saldo_actual, 0) AS saldo_bolsillo,
      NVL(pe.cant_participantes, 0) AS cant_participantes
    FROM Encuentros e
    LEFT JOIN Presupuestos p ON e.id_encuentro = p.id_encuentro
    LEFT JOIN Bolsillos b ON e.id_encuentro = b.id_encuentro
    LEFT JOIN (
      SELECT id_encuentro, COUNT(*) AS cant_participantes
      FROM Participantes_Encuentro
      GROUP BY id_encuentro
    ) pe ON e.id_encuentro = pe.id_encuentro
  `
})
export class EncuentroResumen {
  @ViewColumn({ name: 'ID_ENCUENTRO' })
  idEncuentro: number;

  @ViewColumn({ name: 'TITULO' })
  titulo: string;

  @ViewColumn({ name: 'LUGAR' })
  lugar: string;

  @ViewColumn({ name: 'FECHA' })
  fecha: Date;

  @ViewColumn({ name: 'ID_PRESUPUESTO' })
  idPresupuesto: number | null;

  @ViewColumn({ name: 'PRESUPUESTO_TOTAL' })
  presupuestoTotal: number;

  @ViewColumn({ name: 'ID_BOLSILLO' })
  idBolsillo: number | null;

  @ViewColumn({ name: 'NOMBRE_BOLSILLO' })
  nombreBolsillo: string;

  @ViewColumn({ name: 'SALDO_BOLSILLO' })
  saldoBolsillo: number;

  @ViewColumn({ name: 'CANT_PARTICIPANTES' })
  cantParticipantes: number;
}
