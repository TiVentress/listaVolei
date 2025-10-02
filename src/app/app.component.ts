// Ficheiro: src/app/app.component.ts

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common'; // <-- ADICIONE ESTA IMPORTAÇÃO
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './components/header/header.component';

@Component({
  selector: 'app-root',
  standalone: true,
  // ADICIONE CommonModule AQUI
  imports: [CommonModule, RouterOutlet, HeaderComponent],
  templateUrl: './app.component.html',
})
export class AppComponent {
  title = 'listaVolei';
}