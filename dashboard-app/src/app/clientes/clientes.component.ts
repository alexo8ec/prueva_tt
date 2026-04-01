import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ClientesService, Cliente } from '../services/clientes.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-clientes',
  templateUrl: './clientes.component.html',
  styleUrls: ['./clientes.component.css'],
  standalone: true,
  imports: [FormsModule, CommonModule, RouterModule]
})
export class ClientesComponent implements OnInit {
  clientes: Cliente[] = [];
  modalAbierto = false;
  editando = false;
  clienteSeleccionado: Cliente | null = null;
  nuevoCliente: Cliente = this.getClienteVacio();

  constructor(private clientesService: ClientesService, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.cargarClientes();
  }

  cargarClientes() {
    this.clientesService.getClientes().subscribe(clientes => {
      this.clientes = clientes;
    });
  }

  abrirModalAgregar() {
    this.editando = false;
    this.nuevoCliente = this.getClienteVacio();
    this.modalAbierto = true;
    this.cdr.detectChanges();
  }

  abrirModalEditar(cliente: Cliente) {
    this.editando = true;
    this.clienteSeleccionado = cliente;
    this.nuevoCliente = { ...this.getClienteVacio(), ...cliente };
    this.modalAbierto = true;
    this.cdr.detectChanges();
  }

  cerrarModal() {
    this.modalAbierto = false;
    this.nuevoCliente = this.getClienteVacio();
    this.clienteSeleccionado = null;
    this.cdr.detectChanges();
  }
  getClienteVacio(): Cliente {
    return { nombre: '', apellido: '', email: '', telefono: '' };
  }

  guardarCliente() {
    if (this.editando && this.clienteSeleccionado && this.clienteSeleccionado.id) {
      this.clientesService.actualizarCliente(this.clienteSeleccionado.id, this.nuevoCliente).subscribe(() => {
        this.cargarClientes();
        this.cerrarModal();
      });
    } else {
      this.clientesService.crearCliente(this.nuevoCliente).subscribe(() => {
        this.cargarClientes();
        this.cerrarModal();
      });
    }
  }

  eliminarCliente(cliente: Cliente) {
    if (cliente.id && confirm('¿Seguro que deseas eliminar este cliente?')) {
      this.clientesService.eliminarCliente(cliente.id).subscribe(() => {
        this.cargarClientes();
      });
    }
  }
}
