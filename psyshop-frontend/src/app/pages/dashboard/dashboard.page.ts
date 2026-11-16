import { Component, ChangeDetectorRef, ElementRef, HostListener, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

import {
  ToastController,
  IonContent,
  IonButton,
  IonIcon,
  IonCard,
  IonCardContent
} from '@ionic/angular';

import { addIcons } from 'ionicons';
import {
  chevronDownOutline,
  logInOutline,
  logOutOutline,
  personOutline,
  receiptOutline,
  cartOutline,
  gameControllerOutline,
  shieldCheckmarkOutline,
  trophyOutline
} from 'ionicons/icons';

// Ajusta la ruta si tu servicio está en otra carpeta (igual que en checkout y pedidos)
import { OrderService, UserInfo } from '../../services/order.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    IonContent,
    IonButton,
    IonIcon,
    IonCard,
    IonCardContent
  ],
})
export class DashboardPage {
  private orderService = inject(OrderService);
  private cdr = inject(ChangeDetectorRef);
  private toastCtrl = inject(ToastController);
  private toastActual?: HTMLIonToastElement;

  @ViewChild('heroVideo') heroVideo?: ElementRef<HTMLVideoElement>;

  // Usuario con sesión iniciada (null si no hay sesión)
  user: UserInfo | null = null;

  @ViewChild('userBox') userBox?: ElementRef<HTMLElement>;

  @ViewChild('btnCancelar') btnCancelar?: ElementRef<HTMLButtonElement>;

  // Acordeón de la esquina: abierto o cerrado
  menuAbierto = false;

  // Diálogo de confirmación para cerrar sesión
  confirmandoSalida = false;
  cerrandoSesion = false;

  constructor() {
    addIcons({
      chevronDownOutline,
      logInOutline,
      logOutOutline,
      personOutline,
      receiptOutline,
      cartOutline,
      gameControllerOutline,
      shieldCheckmarkOutline,
      trophyOutline
    });
  }

  get inicial(): string {
    return (this.user?.name ?? '?').trim().charAt(0).toUpperCase();
  }

  get primerNombre(): string {
    return (this.user?.name ?? '').trim().split(' ')[0];
  }

  // Cada vez que entras a Inicio se revisa quién tiene la sesión iniciada
  ionViewWillEnter(): void {
    this.cargarUsuario();
  }

  ionViewDidEnter(): void {
    const v = this.heroVideo?.nativeElement;
    if (v) {
      v.muted = true;
      v.play().catch(() => {});
    }
  }

  ionViewWillLeave(): void {
    this.heroVideo?.nativeElement.pause();
  }

  private cargarUsuario(): void {
    this.orderService.getMe().subscribe({
      next: (user) => {
        this.user = user;
        this.cdr.detectChanges();
      },
      error: () => {
        this.user = null; // sin sesión
        this.cdr.detectChanges();
      }
    });
  }

  alternarMenu(): void {
    this.menuAbierto = !this.menuAbierto;
  }

  elegirOpcion(pestana: string): void {
    this.menuAbierto = false;
    this.irAPestana(pestana);
  }

  // 1) Al tocar "Cerrar sesión" se abre el diálogo de confirmación
  pedirConfirmacion(): void {
    this.menuAbierto = false;
    this.confirmandoSalida = true;
    this.cdr.detectChanges();

    // El foco empieza en "Cancelar": la opción segura
    setTimeout(() => this.btnCancelar?.nativeElement.focus(), 0);
  }

  cancelarSalida(): void {
    if (this.cerrandoSesion) return;
    this.confirmandoSalida = false;
  }

  // 2) Si confirma, se cierra la sesión en el servidor y se limpia el navegador
  confirmarSalida(): void {
    if (this.cerrandoSesion) return;

    this.cerrandoSesion = true;
    const nombre = this.primerNombre;

    this.orderService.logout().subscribe({
      next: () => this.terminarSalida(nombre),
      error: () => this.terminarSalida(nombre)
    });
  }

  // 3) Se limpia todo y se despide al usuario con un aviso
  private terminarSalida(nombre: string): void {
    this.orderService.clearSession();
    this.user = null;
    this.cerrandoSesion = false;
    this.confirmandoSalida = false;
    this.cdr.detectChanges();

    this.mostrarToast('Sesión cerrada', `Vuelve pronto, ${nombre}.`);
  }

  // Aviso con el estilo de PsyShop (usa los estilos de global.scss)
  private async mostrarToast(titulo: string, mensaje: string = ''): Promise<void> {
    await this.toastActual?.dismiss();

    // Si la barra de pestañas se ve, el aviso se ancla a ella: aparece justo encima
    const barra = document.querySelector('ion-tab-bar') as HTMLElement | null;
    const barraVisible = !!barra && barra.offsetParent !== null;

    const opciones: any = {
      header: mensaje ? titulo : undefined,
      message: mensaje || titulo,
      duration: 3000,
      position: 'bottom',
      cssClass: 'psy-toast',
      buttons: [{ text: 'Cerrar', role: 'cancel' }],
    };

    if (barraVisible) {
      opciones.positionAnchor = barra;
    }

    this.toastActual = await this.toastCtrl.create(opciones);
    await this.toastActual.present();
  }

  // El acordeón se cierra al tocar fuera de él o al presionar Escape
  @HostListener('document:click', ['$event'])
  cerrarSiTocasFuera(evento: MouseEvent): void {
    const caja = this.userBox?.nativeElement;
    if (this.menuAbierto && caja && !caja.contains(evento.target as Node)) {
      this.menuAbierto = false;
    }
  }

  @HostListener('document:keydown.escape')
  cerrarConEscape(): void {
    this.menuAbierto = false;
    this.cancelarSalida();
  }

  // Cambia a una pestaña de la barra de abajo usando el nombre que se ve en pantalla
  // (así no depende de cómo se llamen las rutas internas).
  irAPestana(nombre: string): void {
    const botones = Array.from(
      document.querySelectorAll('ion-tab-button')
    ) as HTMLElement[];

    const boton = botones.find(b =>
      (b.textContent ?? '').toLowerCase().includes(nombre.toLowerCase())
    );

    boton?.click();
  }
}