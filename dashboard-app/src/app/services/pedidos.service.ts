import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

import { AuthService } from './auth.service';
import { Cliente } from './clientes.service';

export interface Pedido {
    id: number;
    cliente_id: number;
    estado: string;
    total: number;
    detalles: any[];
    created_at?: string;
    updated_at?: string;
    cliente?: Cliente;
}

@Injectable({ providedIn: 'root' })
export class PedidosService {
    private apiUrl = '/crm/api/v1/pedidos';

    constructor(private http: HttpClient, private auth: AuthService) { }
    getPedido(id: number): Observable<Pedido> {
        return this.http.get<Pedido>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
    }
    getPedidos(): Observable<Pedido[]> {
        return this.http.get<Pedido[]>(this.apiUrl, { headers: this.getHeaders() });
    }
    crearPedido(pedido: any): Observable<Pedido> {
        return this.http.post<Pedido>(this.apiUrl, pedido, { headers: this.getHeaders() });
    }
    updateEstadoPedido(id: number, estado: string) {
        return this.http.put(`${this.apiUrl}/${id}`, { estado }, { headers: this.getHeaders() });
    }

    updateDetallesPedido(id: number, detalles: any[]) {
        return this.http.put(`${this.apiUrl}/${id}`, { detalles }, { headers: this.getHeaders() });
    }
    private getHeaders(): HttpHeaders {
        const token = this.auth.getToken?.();
        let headers = new HttpHeaders();
        if (token) {
            headers = headers.set('Authorization', 'Bearer ' + token);
        }
        return headers;
    }
}
