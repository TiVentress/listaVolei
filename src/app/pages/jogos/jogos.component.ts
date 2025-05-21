import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { RouterModule } from '@angular/router';
import { JogoService } from '../../services/jogo.service';
import { Jogo } from '../../models/jogo.model';
import { AuthService } from '../../services/auth.service';
import { ParticipanteService } from '../../services/participante.service';
import { Participante } from '../../models/participante.model';


@Component({
  selector: 'app-jogos',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './jogos.component.html',
})
export class JogosComponent {
  jogos: Jogo[] = [];

  constructor(
    private jogoService: JogoService,
    private participanteService: ParticipanteService, // <- Adicionado
    private router: Router,
    private authService: AuthService
  ) {
    this.carregar();
  }

  carregar() {
    this.jogos = this.jogoService.listar();

    this.jogos.forEach(jogo => {
      jogo.participantes = this.participanteService.listarPorJogo(jogo.id);
    });
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
      this.carregar(); // <- Atualiza a lista com participantes
    }
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}

