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
  IonButtons,
  IonTitle,
  IonContent,
  IonButton,
  IonIcon,
  IonInput,
  IonTextarea,
  IonText,
  IonSpinner
} from '@ionic/angular';

import { addIcons } from 'ionicons';
import { arrowBackOutline } from 'ionicons/icons';

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
    IonButtons,
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

  constructor() {
    addIcons({ arrowBackOutline });
  }

  // Cada vez que entras al checkout, se rellenan tus datos de la cuenta
  ionViewWillEnter(): void {
    this.precargarDatosDeLaCuenta();
  }

  // Si hay sesión iniciada, se cargan el correo y el nombre de la cuenta.
  // Sin sesión (o si falla), el formulario simplemente queda vacío.
  private precargarDatosDeLaCuenta(): void {
    this.orderService.getMe().subscribe({
      next: (user) => {
        if (!this.customer_email) this.customer_email = user.email;
        if (!this.customer_name) this.customer_name = user.name;
        this.cdr.detectChanges();
      },
      error: () => { /* sin sesión: no pasa nada */ }
    });
  }

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

 
async mostrarToast(
  titulo: string,
  mensaje: string = '',
  tipo: 'ok' | 'error' = 'ok',
  conBotonCarrito = false      // en el checkout puedes borrar este parámetro
) {
  await this.toastActual?.dismiss();

  // Si la barra de pestañas se ve, el aviso se ancla a ella: aparece justo encima
  const barra = document.querySelector('ion-tab-bar') as HTMLElement | null;
  const barraVisible = !!barra && barra.offsetParent !== null;

  const opciones: any = {
    header: mensaje ? titulo : undefined,
    message: mensaje || titulo,
    duration: 3000,
    position: 'bottom',
    cssClass: tipo === 'error' ? 'psy-toast psy-toast--error' : 'psy-toast',
    buttons: conBotonCarrito
      ? [{ text: 'Ver carrito', handler: () => { this.router.navigate(['/cart']); } }]
      : [{ text: 'Cerrar', role: 'cancel' }],
  };

  if (barraVisible) {
    opciones.positionAnchor = barra;
  }

  this.toastActual = await this.toastCtrl.create(opciones);
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
          'Te enviaremos la confirmación a tu correo.'
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