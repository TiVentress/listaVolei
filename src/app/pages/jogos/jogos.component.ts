import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { RouterModule } from '@angular/router';
import { JogoService } from '../../services/jogo.service';
import { Jogo } from '../../models/jogo.model';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-jogos',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './jogos.component.html',
})
export class JogosComponent {
  jogos: Jogo[] = [];

  constructor(private jogoService: JogoService, private router: Router, private authService: AuthService) {
    this.jogos = this.jogoService.listar();
  }

  novo() {
    this.router.navigate(['/jogos/novo']);
  }

  editar(id: number) {
    this.router.navigate(['/jogos/editar', id]);
  }

  remover(id: number) {
    if (confirm('Deseja remover este jogo?')) {
      this.jogoService.remover(id);
      this.jogos = this.jogoService.listar(); // Atualiza a lista
    }
  }

  logout() {
  this.authService.logout();
  this.router.navigate(['/login']);
  }
}
