import { Component, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

import {
  IonContent,
  IonButton,
  IonIcon,
  IonCard,
  IonCardContent
} from '@ionic/angular';


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
    IonCardContent,
  ],
})
export class DashboardPage {
  @ViewChild('heroVideo') heroVideo?: ElementRef<HTMLVideoElement>;

  ionViewDidEnter() {
    const v = this.heroVideo?.nativeElement;
    if (v) {
      v.muted = true;
      v.play().catch(() => {});
    }
  }

  ionViewWillLeave() {
    this.heroVideo?.nativeElement.pause();
  }
}
