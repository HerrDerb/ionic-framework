import { Component, inject } from '@angular/core';
import { IonButton, IonContent, IonHeader, IonTitle, IonToolbar, MenuController } from '@ionic/angular';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  imports: [IonButton, IonContent, IonHeader, IonTitle, IonToolbar],
})
export class HomePage {
  private readonly menu = inject(MenuController);

  openLater(): void {
    setTimeout(() => this.menu.open('settings'), 2000);
  }
}
