
import {
  Component,
  ChangeDetectorRef,
  OnInit,
  OnDestroy,
  inject
} from '@angular/core';

import { CommonModule, CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';

import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonIcon,
  IonImg,
  IonText
} from '@ionic/angular';

import { CartService, CartItem } from '../../services/cart.service';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.page.html',
  styleUrls: ['./cart.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    CurrencyPipe,
    RouterLink,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButton,
    IonIcon,
    IonImg,
    IonText
  ]
})
export class CartPage implements OnInit, OnDestroy {
  private cartService = inject(CartService);
  private cdr = inject(ChangeDetectorRef);
  private cartSubscription?: Subscription;

  subtotal(item: CartItem): number {
  return Number(item.game.price) * item.quantity;
}

  items: CartItem[] = [];
  totalItems = 0;
  totalPrice = 0;

  ngOnInit(): void {
    this.cartSubscription = this.cartService.cart$.subscribe(items => {
      this.items = items;
      this.totalItems = this.cartService.totalItems;
      this.totalPrice = this.cartService.totalPrice;

      this.cdr.detectChanges();
    });
  }

  ngOnDestroy(): void {
    this.cartSubscription?.unsubscribe();
  }

  aumentar(gameId: number): void {
    const success = this.cartService.increaseQuantity(gameId);

    if (!success) {
      alert('No puedes superar las existencias disponibles.');
    }
  }

  disminuir(gameId: number): void {
    this.cartService.decreaseQuantity(gameId);
  }

  eliminar(gameId: number): void {
    this.cartService.removeFromCart(gameId);
  }

  vaciarCarrito(): void {
    this.cartService.clearCart();
  }
}
