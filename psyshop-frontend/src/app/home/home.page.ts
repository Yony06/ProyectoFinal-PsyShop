import {
  Component,
  OnInit,
  OnDestroy,
  inject,
  ChangeDetectorRef
} from '@angular/core';

import { CommonModule, CurrencyPipe } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { Subscription } from 'rxjs';

import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonImg,
  IonSpinner,
  IonText,
  IonSearchbar,
  IonSelect,
  IonSelectOption,
  IonButton,
  IonIcon,
  IonButtons,
  IonBadge,
  ToastController
} from '@ionic/angular';

import { GameService, Game } from '../services/game';
import { CartService } from '../services/cart.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    CurrencyPipe,
    RouterLink,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonImg,
    IonSpinner,
    IonText,
    IonSearchbar,
    IonSelect,
    IonSelectOption,
    IonButton,
    IonIcon,
    IonButtons,
    IonBadge
  ]
})
export class HomePage implements OnInit, OnDestroy {
  private gameService = inject(GameService);
  private cdr = inject(ChangeDetectorRef);
  private cartService = inject(CartService);
  private toastCtrl = inject(ToastController);
  private router = inject(Router);
  
  private toastActual?: HTMLIonToastElement;
  private cartSubscription?: Subscription;

  games: Game[] = [];
  loading = true;
  errorMessage = '';

  searchTerm = '';
  selectedPlatform = '';
  selectedGenre = '';

  totalItemsCarrito = 0;

  ngOnInit(): void {
    // Mantener actualizado el contador del carrito.
    this.cartSubscription = this.cartService.cart$.subscribe(() => {
      this.totalItemsCarrito = this.cartService.totalItems;
      this.cdr.detectChanges();
    });

    // Cargar videojuegos desde Laravel.
    this.gameService.getGames().subscribe({
      next: (response) => {
        this.games = response.data;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error al cargar videojuegos:', error);
        this.errorMessage =
          'No se pudieron cargar los videojuegos. Verifica la conexión con el servidor.';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  ngOnDestroy(): void {
    this.cartSubscription?.unsubscribe();
  }

  agregarAlCarrito(game: Game): void {
    const agregado = this.cartService.addToCart(game);

    if (agregado) {
      this.mostrarToast(`${game.title} se agregó al carrito.`);
    } else {
      this.mostrarToast(
        'No hay suficiente stock disponible para agregar este videojuego.',
        '',
        'error'
      );
    }
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

  get platforms(): string[] {
    return [
      ...new Set(
        this.games
          .map(game => game.platform)
          .filter(
            (platform): platform is string =>
              platform !== null && platform !== ''
          )
      )
    ].sort();
  }

  get genres(): string[] {
    return [
      ...new Set(
        this.games
          .map(game => game.genre)
          .filter(
            (genre): genre is string =>
              genre !== null && genre !== ''
          )
      )
    ].sort();
  }

  get filteredGames(): Game[] {
    const term = this.searchTerm.trim().toLowerCase();

    return this.games.filter(game => {
      const matchesSearch =
        !term ||
        game.title.toLowerCase().includes(term) ||
        (game.description ?? '').toLowerCase().includes(term);

      const matchesPlatform =
        !this.selectedPlatform ||
        game.platform === this.selectedPlatform;

      const matchesGenre =
        !this.selectedGenre ||
        game.genre === this.selectedGenre;

      return matchesSearch && matchesPlatform && matchesGenre;
    });
  }

  onSearch(event: CustomEvent): void {
    this.searchTerm = String(event.detail?.value ?? '');
  }

  onPlatformChange(event: CustomEvent): void {
    this.selectedPlatform = String(event.detail?.value ?? '');
  }

  onGenreChange(event: CustomEvent): void {
    this.selectedGenre = String(event.detail?.value ?? '');
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedPlatform = '';
    this.selectedGenre = '';
  }

  explorarCatalogo(): void {
    document.getElementById('catalogo')?.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    });
  }

  filtrarPlataforma(valor: string) {
    this.onPlatformChange({ detail: { value: valor } } as CustomEvent);
  }

  filtrarGenero(valor: string) {
    this.onGenreChange({ detail: { value: valor } } as CustomEvent);
  }
}