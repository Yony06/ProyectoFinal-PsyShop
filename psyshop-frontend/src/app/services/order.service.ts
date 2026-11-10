import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface OrderRequest {
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  delivery_address: string;
  items: {
    game_id: number;
    quantity: number;
  }[];
}

export interface OrderResponse {
  message: string;
  order: {
    id: number;
    customer_name: string;
    subtotal: string;
    total: string;
    status: string;
  };
}

// Pedido tal como lo devuelve Laravel en /api/my-orders
export interface OrderSummary {
  id: number;
  status: string;
  total: number | string;
  created_at: string;
  items?: {
    game_id: number;
    quantity: number;
    unit_price?: number | string;
    subtotal?: number | string;
    game?: { title: string };
  }[];
}

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private http = inject(HttpClient);

  private baseUrl = 'http://127.0.0.1:8000/api';
  private apiUrl = `${this.baseUrl}/orders`;

  // Si hay sesión iniciada, se envía el token para que el pedido quede ligado
  // a la cuenta. Sin sesión, la compra sigue funcionando como invitado.
  createOrder(data: OrderRequest): Observable<OrderResponse> {
    return this.http.post<OrderResponse>(this.apiUrl, data, {
      headers: this.authHeaders()
    });
  }

  // Pedidos del cliente que inició sesión
  getMyOrders(): Observable<OrderSummary[]> {
    return this.http
      .get<{ orders: OrderSummary[] }>(`${this.baseUrl}/my-orders`, {
        headers: this.authHeaders()
      })
      .pipe(map(res => res.orders ?? []));
  }

  // Envía el token de la sesión (Laravel Sanctum) para saber quién es el cliente.
  private authHeaders(): HttpHeaders {
    const token = this.buscarToken();
    return token
      ? new HttpHeaders({ Authorization: `Bearer ${token}` })
      : new HttpHeaders();
  }

  // Busca solo el token guardado por tu login: no importa cómo lo hayas llamado,
  // basta con que el nombre de la clave contenga la palabra "token".
  private buscarToken(): string | null {
    for (const almacen of [localStorage, sessionStorage]) {
      for (let i = 0; i < almacen.length; i++) {
        const clave = almacen.key(i);
        if (clave && clave.toLowerCase().includes('token')) {
          const valor = almacen.getItem(clave);
          if (valor) {
            return valor.replace(/^"|"$/g, ''); // quita comillas si se guardó como JSON
          }
        }
      }
    }
    return null;
  }
}