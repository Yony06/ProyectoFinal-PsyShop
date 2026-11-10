import { bootstrapApplication } from '@angular/platform-browser';
import { RouteReuseStrategy, provideRouter, withComponentInputBinding, withPreloading, PreloadAllModules } from '@angular/router';
import { IonicRouteStrategy, provideIonicAngular } from '@ionic/angular';
import { provideHttpClient } from '@angular/common/http';
import { routes } from './app/app.routes';
import { AppComponent } from './app/app.component';
import { addIcons } from 'ionicons';
import { withInterceptors } from '@angular/common/http';
import { authInterceptor } from './app/services/auth-interceptor';

import {
  homeOutline,
  gameControllerOutline,
  cartOutline,
  receiptOutline,
  personCircleOutline,
  shieldCheckmarkOutline,
  trophyOutline
} from 'ionicons/icons';

addIcons({
  'home-outline': homeOutline,
  'game-controller-outline': gameControllerOutline,
  'cart-outline': cartOutline,
  'receipt-outline': receiptOutline,
  'person-circle-outline': personCircleOutline,
  'shield-checkmark-outline': shieldCheckmarkOutline,
  'trophy-outline': trophyOutline
});

bootstrapApplication(AppComponent, {
  providers: [
     { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
  provideIonicAngular(),
  provideHttpClient(withInterceptors([authInterceptor])),
  provideRouter(routes, withPreloading(PreloadAllModules), withComponentInputBinding()),
],
});
