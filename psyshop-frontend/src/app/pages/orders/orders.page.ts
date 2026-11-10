import { Component, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonIcon,
  IonButton,
  IonSpinner
} from '@ionic/angular';

import { addIcons } from 'ionicons';
import {
  receiptOutline,
  timeOutline,
  checkmarkCircleOutline,
  closeCircleOutline,
  bagHandleOutline,
  gameControllerOutline,
  arrowForwardOutline
} from 'ionicons/icons';

// Ajusta la ruta a donde está tu servicio (igual que en el checkout)
import { OrderService, OrderSummary } from '../../services/order.service';

type TipoEstado = 'pending' | 'done' | 'cancelled' | 'other';

@Component({
  selector: 'app-orders',
  templateUrl: './orders.page.html',
  styleUrls: ['./orders.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonIcon,
    IonButton,
    IonSpinner,
    RouterLink
  ]
})
export class OrdersPage {
  private orderService = inject(OrderService);
  private cdr = inject(ChangeDetectorRef);

  orders: OrderSummary[] = [];
  loading = false;
  errorMessage = '';
  noAutenticado = false;


  constructor() {
    addIcons({
      receiptOutline,
      timeOutline,
      checkmarkCircleOutline,
      closeCircleOutline,
      bagHandleOutline,
      gameControllerOutline,
      arrowForwardOutline
    });
  }

  // Se ejecuta cada vez que entras a la pestaña (así siempre ves datos al día)
  ionViewWillEnter(): void {
    this.cargarPedidos();
  }

  cargarPedidos(): void {
    this.loading = true;
    this.errorMessage = '';
    this.noAutenticado = false;

    this.orderService.getMyOrders().subscribe({
      next: (orders) => {
        this.orders = orders;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error al cargar pedidos:', error);
        this.loading = false;

        if (error.status === 401) {
          this.noAutenticado = true;
        } else {
          this.errorMessage = 'Verifica tu conexión e inténtalo de nuevo.';
        }

        this.cdr.detectChanges();
      }
    });
  }

  // ---------- Estadísticas ----------
  get totalPedidos(): number {
    return this.orders.length;
  }

  get pendientes(): number {
    return this.orders.filter(o => this.tipoEstado(o) === 'pending').length;
  }

  get completados(): number {
    return this.orders.filter(o => this.tipoEstado(o) === 'done').length;
  }

  // ---------- Estado de cada pedido ----------
  // Acepta los estados en español o inglés. Si tu API usa otros nombres,
  // agrégalos a estas listas.
  tipoEstado(order: OrderSummary): TipoEstado {
    const s = (order.status ?? '').toLowerCase().trim();

    if (['pending', 'pendiente'].includes(s)) return 'pending';
    if (['completed', 'completado', 'delivered', 'entregado'].includes(s)) return 'done';
    if (['cancelled', 'canceled', 'cancelado'].includes(s)) return 'cancelled';
    return 'other';
  }

  estadoTexto(order: OrderSummary): string {
    switch (this.tipoEstado(order)) {
      case 'pending': return 'Pendiente';
      case 'done': return 'Completado';
      case 'cancelled': return 'Cancelado';
      default: {
        const s = order.status ?? 'Sin estado';
        return s.charAt(0).toUpperCase() + s.slice(1);
      }
    }
  }
}