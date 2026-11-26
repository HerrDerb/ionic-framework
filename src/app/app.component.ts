import { Component, inject } from '@angular/core';
import {
  IonApp,
  IonButton,
  IonContent,
  IonHeader,
  IonMenu,
  IonRouterOutlet,
  IonTitle,
  IonToolbar,
  MenuController,
} from '@ionic/angular';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  imports: [IonApp, IonButton, IonContent, IonHeader, IonMenu, IonRouterOutlet, IonTitle, IonToolbar],
})
export class AppComponent {
  private readonly menu = inject(MenuController);

  closeLater(): void {
    setTimeout(() => this.menu.close('settings'), 2000);
  }
}
