
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Game } from './game';

export interface CartItem {
  game: Game;
  quantity: number;
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private readonly storageKey = 'psyshop_cart';

  private cartSubject = new BehaviorSubject<CartItem[]>([]);

  cart$ = this.cartSubject.asObservable();

  constructor() {
    this.cartSubject.next(this.loadCart());
  }

  private loadCart(): CartItem[] {
    try {
      const savedCart = localStorage.getItem(this.storageKey);

      if (!savedCart) {
        return [];
      }

      const parsed: unknown = JSON.parse(savedCart);

      if (!Array.isArray(parsed)) {
        return [];
      }

      return parsed.filter(
        (item): item is CartItem =>
          item !== null &&
          typeof item === 'object' &&
          'game' in item &&
          'quantity' in item &&
          typeof item.quantity === 'number' &&
          Number.isInteger(item.quantity) &&
          item.quantity > 0 &&
          typeof item.game === 'object' &&
          item.game !== null &&
          'id' in item.game &&
          'stock' in item.game &&
          'price' in item.game &&
          item.quantity <= Number(item.game.stock)
      );
    } catch {
      return [];
    }
  }

  private updateCart(items: CartItem[]): void {
    this.cartSubject.next(items);

    try {
      localStorage.setItem(
        this.storageKey,
        JSON.stringify(items)
      );
    } catch {
      console.warn('No se pudo guardar el carrito.');
    }
  }

  get items(): CartItem[] {
    return this.cartSubject.value;
  }

  get totalItems(): number {
    return this.items.reduce(
      (total, item) => total + item.quantity,
      0
    );
  }

  get totalPrice(): number {
    return this.items.reduce(
      (total, item) =>
        total + Number(item.game.price) * item.quantity,
      0
    );
  }

  addToCart(game: Game): boolean {
    if (game.stock <= 0) {
      return false;
    }

    const items = [...this.items];

    const existingItem = items.find(
      item => item.game.id === game.id
    );

    if (existingItem) {
      if (existingItem.quantity >= game.stock) {
        return false;
      }

      existingItem.quantity++;
    } else {
      items.push({
        game,
        quantity: 1
      });
    }

    this.updateCart(items);
    return true;
  }

  increaseQuantity(gameId: number): boolean {
    const items = [...this.items];

    const item = items.find(
      entry => entry.game.id === gameId
    );

    if (!item || item.quantity >= item.game.stock) {
      return false;
    }

    item.quantity++;
    this.updateCart(items);

    return true;
  }

  decreaseQuantity(gameId: number): void {
    const items = [...this.items];

    const item = items.find(
      entry => entry.game.id === gameId
    );

    if (!item) {
      return;
    }

    if (item.quantity > 1) {
      item.quantity--;
      this.updateCart(items);
    } else {
      this.removeFromCart(gameId);
    }
  }

  removeFromCart(gameId: number): void {
    const items = this.items.filter(
      item => item.game.id !== gameId
    );

    this.updateCart(items);
  }

  clearCart(): void {
    this.updateCart([]);
  }
}
