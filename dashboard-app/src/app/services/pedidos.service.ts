import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

export interface Pedido {
  id: number;
  cliente: string;
  producto: string;
  cantidad: number;
  detalles?: string;
}

@Injectable({ providedIn: 'root' })
export class PedidosService {
  private apiUrl = '/crm/api/v1/pedidos';

  constructor(private http: HttpClient, private auth: AuthService) {}

  getPedidos(): Observable<Pedido[]> {
    return this.http.get<Pedido[]>(this.apiUrl, { headers: this.getHeaders() });
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
