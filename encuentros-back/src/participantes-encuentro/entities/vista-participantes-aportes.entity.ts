import { ViewEntity, ViewColumn } from 'typeorm';

@ViewEntity({
  name: 'VISTAPARTICIPANTESAPORTES',
  expression: `
    SELECT 
      p.id_encuentro,
      e.titulo AS nombre_encuentro,
      p.id_usuario,
      u.nombre AS nombre_usuario,
      u.apellido AS apellido_usuario,
      p.rol,
      NVL(SUM(a.monto),0) AS total_aportes
    FROM Participantes_Encuentro p
    JOIN Usuarios u ON p.id_usuario = u.id_usuario        
    JOIN Encuentros e ON p.id_encuentro = e.id_encuentro
    LEFT JOIN Aportes a ON p.id_usuario = a.id_usuario 
                         AND p.id_encuentro = a.id_encuentro
    GROUP BY 
      p.id_encuentro, e.titulo, p.id_usuario, u.nombre, u.apellido, p.rol
  `
})
export class VistaParticipantesAportes {
  @ViewColumn({ name: 'ID_ENCUENTRO' })
  idEncuentro: number;

  @ViewColumn({ name: 'NOMBRE_ENCUENTRO' })
  nombreEncuentro: string;

  @ViewColumn({ name: 'ID_USUARIO' })
  idUsuario: number;

  @ViewColumn({ name: 'NOMBRE_USUARIO' })
  nombreUsuario: string;

  @ViewColumn({ name: 'APELLIDO_USUARIO' })
  apellidoUsuario: string;

  @ViewColumn({ name: 'ROL' })
  rol: string;

  @ViewColumn({ name: 'TOTAL_APORTES' })
  totalAportes: number;
}
