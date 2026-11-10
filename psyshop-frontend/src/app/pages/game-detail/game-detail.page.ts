
import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonButton,
  IonCard,
  IonCardContent,
  IonSpinner,
  IonText,
  IonImg,
  IonBackButton,
  IonButtons
} from '@ionic/angular';

import { GameService, Game } from '../../services/game';

@Component({
  selector: 'app-game-detail',
  templateUrl: './game-detail.page.html',
  styleUrls: ['./game-detail.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    CurrencyPipe,
    RouterLink,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonButton,
    IonCard,
    IonCardContent,
    IonSpinner,
    IonText,
    IonImg,
    IonBackButton,
    IonButtons
  ]
})
export class GameDetailPage implements OnInit {
  private route = inject(ActivatedRoute);
  private gameService = inject(GameService);
  private cdr = inject(ChangeDetectorRef);

  game: Game | null = null;
  loading = true;
  errorMessage = '';

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    if (!Number.isInteger(id) || id <= 0) {
      this.errorMessage = 'El identificador del videojuego no es válido.';
      this.loading = false;
      return;
    }

    this.gameService.getGameById(id).subscribe({
  next: (game) => {
    this.game = game;
    this.loading = false;
    this.cdr.detectChanges();
  },
  error: (error) => {
    console.error('Error al cargar el videojuego:', error);
    this.errorMessage = 'No se pudo cargar el videojuego.';
    this.loading = false;
    this.cdr.detectChanges();
  }
    });
  }
}
