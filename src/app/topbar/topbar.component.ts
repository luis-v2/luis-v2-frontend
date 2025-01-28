import { Component } from '@angular/core';
import { ImageModule } from 'primeng/image';

@Component({
  selector: 'luis-topbar',
  standalone: true,
  imports: [
    ImageModule
  ],
  templateUrl: './topbar.component.html',
  styleUrl: './topbar.component.scss'
})
export class TopbarComponent {
  logoPath : string;
  constructor() {
    this.logoPath = 'assets/logo/LuisV2Logo.png';
  }
}
