import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './components/header/header.component'; // 1. IMPORTAR o HeaderComponent

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule, 
    RouterOutlet, 
    HeaderComponent // 2. ADICIONAR o HeaderComponent aos imports
  ],
  templateUrl: './app.component.html',
})
export class AppComponent {
  title = 'listaVolei';
}
