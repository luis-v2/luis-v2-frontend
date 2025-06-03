import { Component } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { ImageModule } from 'primeng/image';
import { MenubarModule } from 'primeng/menubar';

@Component({
  selector: 'luis-topbar',
  standalone: true,
  imports: [
    ImageModule,
    MenubarModule
  ],
  templateUrl: './topbar.component.html',
  styleUrl: './topbar.component.scss'
})
export class TopbarComponent {
  logoPath : string;

  menuItems: MenuItem[] = [
    {
      label: 'Dashboard',
      icon: 'pi pi-home',
      routerLink: 'dashboard'
    },
    {
      label: 'Trends',
      icon: 'pi pi-chart-line',
      routerLink: 'trends'
    }
  ]

  constructor() {
    this.logoPath = 'assets/logo/LuisV2Logo.png';
  }
}
