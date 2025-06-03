import { Component } from '@angular/core';
import { TopbarComponent } from './topbar/topbar.component';
import { RouterOutlet } from '@angular/router';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'luis-root',
  standalone: true,
  imports: [TopbarComponent, RouterOutlet, ToastModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {

}
