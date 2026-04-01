import Swal from 'sweetalert2';
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
    Swal.fire({
      title: 'Cargando clientes...',
      allowOutsideClick: false,
      allowEscapeKey: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });
    this.clientesService.getClientes().subscribe({
      next: (clientes) => {
        this.clientes = clientes;
        Swal.close();
      },
      error: () => {
        Swal.close();
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudieron cargar los clientes.'
        });
      }
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
      Swal.fire({
        title: 'Actualizando cliente...',
        allowOutsideClick: false,
        allowEscapeKey: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });
      this.clientesService.actualizarCliente(this.clienteSeleccionado.id, this.nuevoCliente).subscribe({
        next: () => {
          this.cargarClientes();
          this.cerrarModal();
          Swal.close();
          Swal.fire({
            icon: 'success',
            title: 'Cliente actualizado',
            text: 'Los datos del cliente fueron actualizados correctamente.',
            timer: 2000,
            showConfirmButton: false
          });
        },
        error: () => {
          Swal.close();
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'No se pudo actualizar el cliente.',
          });
        }
      });
    } else {
      Swal.fire({
        title: 'Registrando cliente...',
        allowOutsideClick: false,
        allowEscapeKey: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });
      this.clientesService.crearCliente(this.nuevoCliente).subscribe({
        next: (resp) => {
          this.cargarClientes();
          this.cerrarModal();
          Swal.close();
          Swal.fire({
            icon: 'success',
            title: 'Cliente creado',
            text: `El cliente ${resp?.nombre} ${resp?.apellido} fue registrado correctamente.`,
            timer: 2000,
            showConfirmButton: false
          });
        },
        error: () => {
          Swal.close();
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'No se pudo registrar el cliente.',
          });
        }
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
