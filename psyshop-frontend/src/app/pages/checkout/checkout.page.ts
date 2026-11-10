import {
  Component,
  ChangeDetectorRef,
  inject
} from '@angular/core';

import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import {
  ToastController,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonIcon,
  IonInput,
  IonTextarea,
  IonText,
  IonSpinner
} from '@ionic/angular';

import { CartService } from '../../services/cart.service';
import {
  OrderService,
  OrderRequest
} from '../../services/order.service';

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.page.html',
  styleUrls: ['./checkout.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    CurrencyPipe,
    FormsModule,
    RouterLink,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButton,
    IonIcon,
    IonInput,
    IonTextarea,
    IonText,
    IonSpinner
  ]
})
export class CheckoutPage {
  private cartService = inject(CartService);
  private orderService = inject(OrderService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);
  private toastCtrl = inject(ToastController);
  private toastActual?: HTMLIonToastElement;

  precioSubtotal(precio: string | number, cantidad: number): number {
    return Number(precio) * cantidad;
  }

  items = this.cartService.items;

  customer_name = '';
  customer_email = '';
  customer_phone = '';
  delivery_address = '';

  submitting = false;
  errorMessage = '';

  get total(): number {
    return this.items.reduce(
      (sum, item) =>
        sum + Number(item.game.price) * item.quantity,
      0
    );
  }

  // Aviso con el estilo de PsyShop (usa los estilos de global.scss)
  async mostrarToast(
    titulo: string,
    mensaje: string = '',
    tipo: 'ok' | 'error' = 'ok'
  ) {
    await this.toastActual?.dismiss();

    // Solo sube el aviso si la barra de pestañas está realmente visible
    const barra = document.querySelector('ion-tab-bar') as HTMLElement | null;
    const hayTabs = !!barra && barra.offsetParent !== null;

    const clases = ['psy-toast'];
    if (tipo === 'error') clases.push('psy-toast--error');
    if (hayTabs) clases.push('psy-toast--above-tabs');

    this.toastActual = await this.toastCtrl.create({
      header: mensaje ? titulo : undefined,
      message: mensaje || titulo,
      duration: 3000,
      position: 'bottom',
      cssClass: clases,
      buttons: [{ text: 'Cerrar', role: 'cancel' }],
    });

    await this.toastActual.present();
  }

  enviarPedido(): void {
    this.errorMessage = '';

    if (this.items.length === 0) {
      this.errorMessage = 'Tu carrito está vacío.';
      return;
    }

    if (
      !this.customer_name.trim() ||
      !this.customer_email.trim() ||
      !this.customer_phone.trim() ||
      !this.delivery_address.trim()
    ) {
      this.errorMessage = 'Completa todos los campos.';
      return;
    }

    const emailValido =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.customer_email);

    if (!emailValido) {
      this.errorMessage = 'Introduce un correo electrónico válido.';
      return;
    }

    const data: OrderRequest = {
      customer_name: this.customer_name.trim(),
      customer_email: this.customer_email.trim(),
      customer_phone: this.customer_phone.trim(),
      delivery_address: this.delivery_address.trim(),
      items: this.items.map(item => ({
        game_id: item.game.id,
        quantity: item.quantity
      }))
    };

    this.submitting = true;

    this.orderService.createOrder(data).subscribe({
      next: (response) => {
        this.cartService.clearCart();
        this.submitting = false;
        this.cdr.detectChanges();

        // Antes: alert(`¡Pedido registrado! Tu número de pedido es ...`)
        this.mostrarToast(
          `Pedido #${response.order.id} registrado`,
          'Quedó pendiente de confirmación.'
        );

        this.router.navigate(['/tabs/inicio']);
      },
      error: (error) => {
        console.error('Error al registrar pedido:', error);

        this.submitting = false;

        if (error.status === 422) {
          this.errorMessage =
            error.error?.message ??
            'Revisa los datos y la disponibilidad de los videojuegos.';
        } else {
          this.errorMessage =
            'No se pudo registrar el pedido. Verifica la conexión e inténtalo de nuevo.';
        }

        this.cdr.detectChanges();
      }
    });
  }
}