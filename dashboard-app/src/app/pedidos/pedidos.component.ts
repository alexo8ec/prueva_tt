import Swal from 'sweetalert2';
import { Component, ChangeDetectorRef, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PedidosService } from '../services/pedidos.service';
import { ClientesService, Cliente } from '../services/clientes.service';
interface DetallePedido {
    producto: string;
    cantidad: number;
    precio: number;
}
@Component({
    selector: 'app-pedidos',
    templateUrl: './pedidos.component.html',
    styleUrls: ['./pedidos.component.css'],
    standalone: true,
    imports: [FormsModule, CommonModule, RouterModule],
})


export class PedidosComponent implements OnInit {
    // Tipado explícito para los detalles
    nuevoPedido: { cliente_id: string | number; detalles: DetallePedido[] } = this.getPedidoVacio();
    modalEditarAbierto = false;
    pedidoEditando: any = null;
    editando = false;
    pedidos: any[] = [];
    cargandoPedidos = false;
    pedidosFiltrados: any[] = [];
    modalAbierto = false;
    filtroEstado = '';
    filtroCliente = '';
    filtroFecha = '';
    clientes: Cliente[] = [];

    constructor(
        private cdr: ChangeDetectorRef,
        private pedidosService: PedidosService,
        private clientesService: ClientesService
    ) { }

    ngOnInit() {
        this.cargarPedidos();
        this.cargarClientes();
    }

    productos = [
        { nombre: 'Laptop', precio: 1000 },
        { nombre: 'Mouse', precio: 50 },
        { nombre: 'Teclado', precio: 80 },
        { nombre: 'Monitor', precio: 400 },
        { nombre: 'Impresora', precio: 250 },
        { nombre: 'Parlante', precio: 15 },
        { nombre: 'HDMI', precio: 2.36 }
    ];

    getTotalEditando(): number {
        if (!this.pedidoEditando || !this.pedidoEditando.detalles) return 0;
        return this.pedidoEditando.detalles.reduce((acc: number, det: any) => acc + (Number(det.precio) * Number(det.cantidad)), 0);
    }

    cargarClientes() {
        this.clientesService.getClientes().subscribe(clientes => {
            this.clientes = clientes;
            this.cdr.detectChanges();
        });
    }

    cargarPedidos() {
        this.cargandoPedidos = true;
        Swal.fire({
            title: 'Cargando pedidos...',
            allowOutsideClick: false,
            allowEscapeKey: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });
        this.pedidosService.getPedidos().subscribe({
            next: (data: any[]) => {
                if (!Array.isArray(data)) {
                    this.pedidos = [data];
                } else {
                    this.pedidos = data;
                }
                this.filtrarPedidos();
                this.cdr.detectChanges();
                this.cargandoPedidos = false;
                Swal.close();
            },
            error: () => {
                this.cargandoPedidos = false;
                Swal.close();
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'No se pudieron cargar los pedidos.'
                });
            }
        });
    }

    filtrarPedidos() {
        this.pedidosFiltrados = this.pedidos.filter(p => {
            const coincideEstado = this.filtroEstado ? p.estado === this.filtroEstado : true;
            const coincideCliente = this.filtroCliente ? (p.cliente?.nombre + ' ' + p.cliente?.apellido).toLowerCase().includes(this.filtroCliente.toLowerCase()) : true;
            const coincideFecha = this.filtroFecha ? p.created_at?.startsWith(this.filtroFecha) : true;
            return coincideEstado && coincideCliente && coincideFecha;
        });
    }

    abrirModalAgregar() {
        this.nuevoPedido = this.getPedidoVacio();
        this.nuevoPedido.detalles = [];
        this.modalAbierto = true;
        this.cdr.detectChanges();
    }

    cerrarModal() {
        this.modalAbierto = false;
        this.nuevoPedido = this.getPedidoVacio();
        this.cdr.detectChanges();
    }

    agregarDetalleNuevo() {
        if (!this.nuevoPedido.detalles) this.nuevoPedido.detalles = [];
        this.nuevoPedido.detalles.push({ producto: '', cantidad: 1, precio: 0 } as DetallePedido);
    }

    eliminarDetalleNuevo(i: number) {
        this.nuevoPedido.detalles.splice(i, 1);
    }

    actualizarPrecioDetalle(det: DetallePedido) {
        const prod = this.productos.find((p: { nombre: string; precio: number }) => p.nombre === det.producto);
        if (prod) det.precio = prod.precio;
    }

    agregarPedido() {
        const payload = {
            cliente_id: this.nuevoPedido.cliente_id,
            total: this.totalPedido,
            estado: 'pendiente',
            detalles: this.nuevoPedido.detalles
        };
        Swal.fire({
            title: 'Enviando pedido...',
            allowOutsideClick: false,
            allowEscapeKey: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });
        this.pedidosService.crearPedido(payload).subscribe({
            next: (resp) => {
                this.cerrarModal();
                this.cargarPedidos();
                Swal.close();
                Swal.fire({
                    icon: 'success',
                    title: 'Pedido creado',
                    text: `El pedido #${resp?.id || ''} fue generado correctamente.`,
                    timer: 2500,
                    showConfirmButton: false
                });
            },
            error: (err) => {
                Swal.close();
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Error al crear el pedido',
                });
            }
        });
    }

    editarPedido(pedido: any) {
        Swal.fire({
            title: 'Cargando pedido...',
            allowOutsideClick: false,
            allowEscapeKey: false,
            didOpen: () => Swal.showLoading()
        });
            this.pedidosService.getPedido(pedido.id).subscribe({
                next: (data) => {
                    let cliente: Cliente | undefined = data.cliente;
                    // Fallback: si no viene el objeto cliente, buscarlo en la lista local
                    if (!cliente && data.cliente_id && this.clientes.length) {
                        cliente = this.clientes.find(c => c.id == data.cliente_id);
                    }
                    this.pedidoEditando = {
                        id: data.id,
                        estado: data.estado,
                        detalles: data.detalles ? data.detalles.map((d: any) => ({ ...d })) : [],
                        cliente: cliente || { nombre: '', apellido: '' }
                    };
                    this.modalEditarAbierto = true;
                    this.cdr.detectChanges();
                    Swal.close();
                },
                error: () => {
                    Swal.close();
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: 'No se pudo cargar el pedido.'
                    });
                }
            });
    }

    agregarDetalle() {
        if (this.pedidoEditando && this.pedidoEditando.detalles) {
            this.pedidoEditando.detalles.push({ producto: '', cantidad: 1, precio: 0 });
        }
    }

    eliminarDetalle(i: number) {
        if (this.pedidoEditando && this.pedidoEditando.detalles) {
            this.pedidoEditando.detalles.splice(i, 1);
        }
    }

    cerrarModalEditar() {
        this.modalEditarAbierto = false;
        this.pedidoEditando = null;
        this.cdr.detectChanges();
    }

    guardarEdicionPedido() {
        if (!this.pedidoEditando) return;
        Swal.fire({
            title: 'Actualizando pedido...',
            allowOutsideClick: false,
            allowEscapeKey: false,
            didOpen: () => Swal.showLoading()
        });
        this.pedidosService.updateDetallesPedido(this.pedidoEditando.id, this.pedidoEditando.detalles).subscribe({
            next: () => {
                this.cargarPedidos();
                this.cerrarModalEditar();
                Swal.close();
                Swal.fire({
                    icon: 'success',
                    title: 'Pedido actualizado',
                    timer: 1500,
                    showConfirmButton: false
                });
            },
            error: () => {
                Swal.close();
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'No se pudo actualizar el pedido.'
                });
            }
        });
    }

    eliminarPedido(pedido: any) {
        if (confirm('¿Seguro que deseas eliminar este pedido?')) {
            // Aquí deberías llamar a la API para eliminar el pedido
            this.pedidos = this.pedidos.filter(p => p.id !== pedido.id);
            this.filtrarPedidos();
        }
    }

    marcarCompletado(pedido: any) {
        Swal.fire({
            title: '¿Marcar como completado?',
            text: '¿Estás seguro de que deseas marcar este pedido como completado?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Sí, completar',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                Swal.fire({
                    title: 'Actualizando...',
                    allowOutsideClick: false,
                    allowEscapeKey: false,
                    didOpen: () => Swal.showLoading()
                });
                this.pedidosService.updateEstadoPedido(pedido.id, 'completado').subscribe(() => {
                    this.cargarPedidos();
                    Swal.close();
                    Swal.fire({
                        icon: 'success',
                        title: 'Pedido completado',
                        timer: 1500,
                        showConfirmButton: false
                    });
                });
            }
        });
    }

    marcarCancelado(pedido: any) {
        Swal.fire({
            title: '¿Cancelar pedido?',
            text: '¿Estás seguro de que deseas cancelar este pedido?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sí, cancelar',
            cancelButtonText: 'No'
        }).then((result) => {
            if (result.isConfirmed) {
                Swal.fire({
                    title: 'Cancelando...',
                    allowOutsideClick: false,
                    allowEscapeKey: false,
                    didOpen: () => Swal.showLoading()
                });
                this.pedidosService.updateEstadoPedido(pedido.id, 'cancelado').subscribe(() => {
                    this.cargarPedidos();
                    Swal.close();
                    Swal.fire({
                        icon: 'success',
                        title: 'Pedido cancelado',
                        timer: 1500,
                        showConfirmButton: false
                    });
                });
            }
        });
    }

    getPedidoVacio() {
        return { cliente_id: '', detalles: [] as DetallePedido[] };
    }

    get totalPedido() {
        return this.nuevoPedido.detalles?.reduce((acc: number, det: any) => acc + (Number(det.precio) * Number(det.cantidad)), 0) || 0;
    }
}
