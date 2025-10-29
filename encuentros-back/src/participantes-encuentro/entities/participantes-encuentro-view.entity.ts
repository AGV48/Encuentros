import { ViewEntity, ViewColumn } from 'typeorm';

@ViewEntity({
  name: 'V_PARTICIPANTES_ENCUENTRO',
  expression: `
    SELECT
      e.id_encuentro,
      e.titulo AS titulo_encuentro,
      e.fecha,
      u.id_usuario,
      u.nombre || ' ' || u.apellido AS nombre_completo,
      p.rol
    FROM Participantes_Encuentro p
    JOIN Usuarios u ON p.id_usuario = u.id_usuario
    JOIN Encuentros e ON p.id_encuentro = e.id_encuentro
  `
})
export class ParticipantesEncuentroView {
  @ViewColumn({ name: 'ID_ENCUENTRO' })
  idEncuentro: number;

  @ViewColumn({ name: 'TITULO_ENCUENTRO' })
  tituloEncuentro: string;

  @ViewColumn({ name: 'FECHA' })
  fecha: Date;

  @ViewColumn({ name: 'ID_USUARIO' })
  idUsuario: number;

  @ViewColumn({ name: 'NOMBRE_COMPLETO' })
  nombreCompleto: string;

  @ViewColumn({ name: 'ROL' })
  rol: string;
}
