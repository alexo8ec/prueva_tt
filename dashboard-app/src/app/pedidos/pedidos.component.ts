import { Component, ChangeDetectorRef, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PedidosService } from '../services/pedidos.service';

@Component({
  selector: 'app-pedidos',
  templateUrl: './pedidos.component.html',
  styleUrls: ['./pedidos.component.css'],
  standalone: true,
  imports: [FormsModule, CommonModule, RouterModule],
})
export class PedidosComponent implements OnInit {
  pedidos: any[] = [];
  pedidosFiltrados: any[] = [];
  modalAbierto = false;
  nuevoPedido = this.getPedidoVacio();
  filtroEstado = '';
  filtroCliente = '';
  filtroFecha = '';

  constructor(private cdr: ChangeDetectorRef, private pedidosService: PedidosService) {}

  ngOnInit() {
    this.cargarPedidos();
  }

  cargarPedidos() {
    this.pedidosService.getPedidos().subscribe((data: any[]) => {
      // Si la respuesta es un solo objeto, conviértelo en array
      if (!Array.isArray(data)) {
        this.pedidos = [data];
      } else {
        this.pedidos = data;
      }
      this.filtrarPedidos();
      this.cdr.detectChanges();
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
    this.modalAbierto = true;
    this.cdr.detectChanges();
  }

  cerrarModal() {
    this.modalAbierto = false;
    this.nuevoPedido = this.getPedidoVacio();
    this.cdr.detectChanges();
  }

  agregarPedido() {
    // Aquí deberías llamar a la API para crear el pedido si lo implementas
    this.cerrarModal();
  }

  editarPedido(pedido: any) {
    // Implementar lógica de edición
    alert('Editar pedido ' + pedido.id);
  }

  eliminarPedido(pedido: any) {
    if (confirm('¿Seguro que deseas eliminar este pedido?')) {
      // Aquí deberías llamar a la API para eliminar el pedido
      this.pedidos = this.pedidos.filter(p => p.id !== pedido.id);
      this.filtrarPedidos();
    }
  }

  marcarCompletado(pedido: any) {
    // Implementar lógica para marcar como completado
    alert('Pedido ' + pedido.id + ' marcado como completado');
  }

  marcarCancelado(pedido: any) {
    // Implementar lógica para marcar como cancelado
    alert('Pedido ' + pedido.id + ' marcado como cancelado');
  }

  getPedidoVacio() {
    return { cliente: '', producto: '', cantidad: 1, detalles: '' };
  }
}
