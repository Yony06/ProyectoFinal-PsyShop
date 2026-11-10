import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonCard,
  IonCardContent,
  IonInput,
  IonButton,
  IonText,
  IonSpinner,
  IonIcon,
  IonSegment,
  IonSegmentButton,
  IonLabel,
  ToastController
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import {
  personCircleOutline,
  mailOutline,
  lockClosedOutline,
  logInOutline,
  personAddOutline,
  logOutOutline,
  shieldCheckmarkOutline,
} from 'ionicons/icons';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonCard,
    IonCardContent,
    IonInput,
    IonButton,
    IonText,
    IonSpinner,
    IonIcon,
    IonSegment,
    IonSegmentButton,
    IonLabel
  ],
})
export class ProfilePage implements OnInit {
  mode: 'login' | 'register' = 'login';

  name = '';
  email = '';
  password = '';
  passwordConfirmation = '';

  loading = false;
  errorMessage = '';
  successMessage = '';

  user = this.auth.getUser();

  constructor(private auth: AuthService, private toastController: ToastController) {
    addIcons({
      personCircleOutline,
      mailOutline,
      lockClosedOutline,
      logInOutline,
      personAddOutline,
      logOutOutline,
      shieldCheckmarkOutline,
    });
  }

  ngOnInit(): void {
    this.user = this.auth.getUser();
  }

  changeMode(value: string | number | undefined): void {
    if (value !== 'login' && value !== 'register') {
      return;
    }

    this.mode = value;
    this.errorMessage = '';
    this.successMessage = '';
  }

  submit(): void {
    this.errorMessage = '';
    this.successMessage = '';

    if (!this.email.trim() || !this.password) {
      this.errorMessage = 'Ingresa tu correo y contraseña.';
      return;
    }

    if (this.mode === 'register') {
      if (!this.name.trim()) {
        this.errorMessage = 'Ingresa tu nombre.';
        return;
      }

      if (this.password.length < 8) {
        this.errorMessage =
          'La contraseña debe tener al menos 8 caracteres.';
        return;
      }

      if (this.password !== this.passwordConfirmation) {
        this.errorMessage = 'Las contraseñas no coinciden.';
        return;
      }
    }

    this.loading = true;

    const request =
      this.mode === 'register'
        ? this.auth.register({
            name: this.name.trim(),
            email: this.email.trim(),
            password: this.password,
            password_confirmation: this.passwordConfirmation,
          })
        : this.auth.login({
            email: this.email.trim(),
            password: this.password,
          });

    request.subscribe({
      next: async (response) => {
        this.user = response.user;
        this.password = '';
        this.passwordConfirmation = '';
        this.successMessage = response.message;
        this.loading = false;

        const toast = await this.toastController.create({
          message: this.mode === 'login' ? '¡Sesión iniciada correctamente!' : '¡Registro exitoso!',
          duration: 1500,
          position: 'top',
          color: 'success',
          icon: 'shield-checkmark-outline'
        });
        
        await toast.present();

        toast.onDidDismiss().then(() => {
          window.location.href = '/home';
        });
      },
      error: (error) => {
        this.loading = false;

        const validationErrors = error.error?.errors;
        if (validationErrors) {
          this.errorMessage = Object.values(validationErrors)
            .flat()
            .join(' ');
        } else {
          this.errorMessage =
            error.error?.message ||
            'No fue posible conectar con PsyShop. Intenta nuevamente.';
        }
      },
    });
  }

  logout(): void {
    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.auth.logout().subscribe({
      next: (response) => {
        this.user = null;
        this.password = '';
        this.passwordConfirmation = '';
        this.successMessage = response.message;
        this.loading = false;

        window.location.href = '/perfil';
      },
      error: (error) => {
        this.errorMessage =
          error.error?.message ||
          'No se pudo cerrar la sesión. Comprueba tu conexión.';
        this.loading = false;
      },
    });
  }
}