import {
  Injectable, NotFoundException, BadRequestException, ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Reservacion, EstadoReservacion } from './reservacion.entity';
import { Salida, EstadoSalida } from '../salidas/salida.entity';
import { RutaTarifa } from '../rutas/ruta-tarifa.entity';
import { SalidaTarifa } from '../salidas/salida-tarifa.entity';
import { RutaParada } from '../rutas/ruta-parada.entity';

interface CrearDto {
  salidaId: string;
  paradaOrigenId: string;
  paradaDestinoId: string;
  nombreCompleto: string;
  telefono: string;
  email: string;
  adultos: number;
  menores9: number;
  menores3: number;
  notas?: string;
  empleadoId?: string | null;
}

@Injectable()
export class ReservacionesService {
  constructor(
    @InjectRepository(Reservacion)
    private reservacionesRepo: Repository<Reservacion>,
    @InjectRepository(Salida)
    private salidasRepo: Repository<Salida>,
    @InjectRepository(RutaTarifa)
    private tarifasRepo: Repository<RutaTarifa>,
    @InjectRepository(SalidaTarifa)
    private salidaTarifasRepo: Repository<SalidaTarifa>,
    @InjectRepository(RutaParada)
    private paradasRepo: Repository<RutaParada>,
    private dataSource: DataSource,
  ) {}

  async crear(dto: CrearDto) {
    const salida = await this.salidasRepo.findOne({
      where: { id: dto.salidaId },
      relations: ['ruta'],
    });
    if (!salida) throw new NotFoundException('Salida no encontrada');
    if (salida.estado === EstadoSalida.CERRADA)
      throw new BadRequestException('Esta salida está cerrada');

    // Look up tarifa: salida-specific first, then ruta default
    const salidaTarifa = await this.salidaTarifasRepo.findOne({
      where: {
        salidaId: dto.salidaId,
        paradaOrigenId: dto.paradaOrigenId,
        paradaDestinoId: dto.paradaDestinoId,
      },
    });

    let precioBase: number;

    if (salidaTarifa) {
      precioBase = Number(salidaTarifa.precioUSD);
    } else {
      const rutaTarifa = await this.tarifasRepo.findOne({
        where: {
          rutaId: salida.rutaId,
          paradaOrigenId: dto.paradaOrigenId,
          paradaDestinoId: dto.paradaDestinoId,
        },
      });
      if (!rutaTarifa) throw new NotFoundException('No existe tarifa para ese tramo. Configura precios en la salida o en la ruta.');
      precioBase = Number(rutaTarifa.precioUSD);
    }

    const reservacion = this.reservacionesRepo.create({
      salidaId:        dto.salidaId,
      paradaOrigenId:  dto.paradaOrigenId,
      paradaDestinoId: dto.paradaDestinoId,
      precioUnitario:  precioBase,
      adultos:         dto.adultos,
      menores9:        dto.menores9,
      menores3:        dto.menores3,
      notas:           dto.notas,
      nombreCompleto:  dto.nombreCompleto,
      telefono:        dto.telefono,
      email:           dto.email,
      empleadoId:      dto.empleadoId ?? null,
    });
    return this.reservacionesRepo.save(reservacion);
  }

  // Admin — listar todas con relaciones
  findAll(estado?: EstadoReservacion) {
    return this.reservacionesRepo.find({
      where: estado ? { estado } : {},
      relations: ['salida', 'salida.ruta', 'paradaOrigen', 'paradaDestino', 'empleado'],
      order: { createdAt: 'DESC' },
    });
  }

  // Empleado — sus propias reservas
  findByEmpleado(empleadoId: string) {
    return this.reservacionesRepo.find({
      where: { empleadoId },
      relations: ['salida', 'salida.ruta', 'paradaOrigen', 'paradaDestino'],
      order: { createdAt: 'DESC' },
    });
  }

  // Admin — stats de comisiones por empleado
  async statsEmpleados() {
    const rows = await this.reservacionesRepo
      .createQueryBuilder('r')
      .leftJoin('r.empleado', 'e')
      .select('e.id',           'empleadoId')
      .addSelect('e.name',      'nombre')
      .addSelect('e.email',     'email')
      .addSelect('COUNT(r.id)', 'totalReservas')
      .addSelect(
        `SUM(CASE WHEN r.estado = 'CONFIRMADA' THEN r."adultos" + r."menores9" + r."menores3" ELSE 0 END)`,
        'pasajerosConfirmados',
      )
      .addSelect(
        `COUNT(CASE WHEN r.estado = 'CONFIRMADA' THEN 1 END)`,
        'reservasConfirmadas',
      )
      .addSelect(
        `COUNT(CASE WHEN r.estado = 'PENDIENTE' THEN 1 END)`,
        'reservasPendientes',
      )
      .addSelect(
        `SUM(CASE WHEN r.estado = 'CONFIRMADA' THEN r."precioUnitario" * (r."adultos" + r."menores9" + r."menores3") ELSE 0 END)`,
        'montoTotal',
      )
      .where('r.empleado_id IS NOT NULL')
      .groupBy('e.id')
      .addGroupBy('e.name')
      .addGroupBy('e.email')
      .orderBy('"totalReservas"', 'DESC')
      .getRawMany();

    return rows.map(r => ({
      empleadoId:           r.empleadoId,
      nombre:               r.nombre,
      email:                r.email,
      totalReservas:        Number(r.totalReservas),
      reservasConfirmadas:  Number(r.reservasConfirmadas),
      reservasPendientes:   Number(r.reservasPendientes),
      pasajerosConfirmados: Number(r.pasajerosConfirmados),
      montoTotal:           Number(r.montoTotal),
    }));
  }

  async contarPendientes() {
    const count = await this.reservacionesRepo.count({
      where: { estado: EstadoReservacion.PENDIENTE },
    });
    return { count };
  }

  // Devuelve los números de asiento ocupados para un tramo (por solapamiento de segmentos)
  private async asientosOcupadosEnTramo(
    salidaId: string,
    origenOrden: number,
    destinoOrden: number,
    excluirReservacionId?: string,
  ): Promise<number[]> {
    const rows: Array<{ asientos_asignados: number[] | null }> =
      await this.dataSource.query(
        `SELECT r.asientos_asignados
         FROM reservaciones r
         JOIN ruta_paradas po ON po.id = r.parada_origen_id
         JOIN ruta_paradas pd ON pd.id = r.parada_destino_id
         WHERE r.salida_id = $1
           AND r.estado = 'CONFIRMADA'
           AND ($2::uuid IS NULL OR r.id != $2)
           AND po.orden < $4
           AND pd.orden > $3`,
        [salidaId, excluirReservacionId ?? null, origenOrden, destinoOrden],
      );

    return rows
      .flatMap(row => row.asientos_asignados ?? [])
      .filter((n, i, arr) => arr.indexOf(n) === i)
      .sort((a, b) => a - b);
  }

  // Disponibilidad de asientos para un tramo específico de una salida
  async disponibilidadTramo(salidaId: string, paradaOrigenId: string, paradaDestinoId: string) {
    const salida = await this.salidasRepo.findOne({ where: { id: salidaId } });
    if (!salida) throw new NotFoundException('Salida no encontrada');

    const [origen, destino] = await Promise.all([
      this.paradasRepo.findOne({ where: { id: paradaOrigenId } }),
      this.paradasRepo.findOne({ where: { id: paradaDestinoId } }),
    ]);
    if (!origen || !destino) throw new NotFoundException('Parada no encontrada');

    const ocupados = await this.asientosOcupadosEnTramo(
      salidaId, origen.orden, destino.orden,
    );

    const todosLosAsientos = Array.from({ length: salida.cupoTotal }, (_, i) => i + 1);
    const libres = todosLosAsientos.filter(n => !ocupados.includes(n));

    return {
      cupoTotal: salida.cupoTotal,
      libre:     libres.length,
      ocupados,
      libres,
    };
  }

  async confirmar(id: string) {
    return this.dataSource.transaction(async (manager) => {
      const reservacion = await manager.findOne(Reservacion, {
        where: { id },
        relations: ['salida'],
      });
      if (!reservacion) throw new NotFoundException('Reservación no encontrada');
      if (reservacion.estado !== EstadoReservacion.PENDIENTE)
        throw new BadRequestException('Solo se pueden confirmar reservas pendientes');
      if (!reservacion.paradaOrigenId || !reservacion.paradaDestinoId)
        throw new BadRequestException('La reserva no tiene tramo definido');

      const salida = reservacion.salida;

      // Obtener órdenes de las paradas del tramo
      const [origen, destino] = await Promise.all([
        manager.findOne(RutaParada, { where: { id: reservacion.paradaOrigenId } }),
        manager.findOne(RutaParada, { where: { id: reservacion.paradaDestinoId } }),
      ]);
      if (!origen || !destino) throw new NotFoundException('Parada del tramo no encontrada');

      // Asientos ya ocupados en este tramo por solapamiento
      const ocupados = await this.asientosOcupadosEnTramo(
        salida.id, origen.orden, destino.orden, reservacion.id,
      );

      const totalPasajeros = reservacion.adultos + reservacion.menores9 + reservacion.menores3;

      // Elegir los primeros asientos disponibles (1..cupoTotal que no estén ocupados)
      const asientosLibres: number[] = [];
      for (let n = 1; n <= salida.cupoTotal && asientosLibres.length < totalPasajeros; n++) {
        if (!ocupados.includes(n)) asientosLibres.push(n);
      }

      if (asientosLibres.length < totalPasajeros) {
        throw new ConflictException(
          `Solo hay ${asientosLibres.length} asiento(s) disponible(s) en este tramo`,
        );
      }

      reservacion.estado = EstadoReservacion.CONFIRMADA;
      reservacion.asientosAsignados = asientosLibres;
      await manager.save(reservacion);
      return reservacion;
    });
  }

  async cancelar(id: string) {
    return this.dataSource.transaction(async (manager) => {
      const reservacion = await manager.findOne(Reservacion, { where: { id } });
      if (!reservacion) throw new NotFoundException('Reservación no encontrada');
      if (reservacion.estado === EstadoReservacion.CANCELADA)
        throw new BadRequestException('Esta reserva ya está cancelada');

      reservacion.estado = EstadoReservacion.CANCELADA;
      reservacion.asientosAsignados = null;
      await manager.save(reservacion);
      return reservacion;
    });
  }
}
