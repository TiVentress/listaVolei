import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { JogoService } from '../../services/jogo.service';
import { ParticipanteService } from '../../services/participante.service';
import { AuthService } from '../../services/auth.service';
import { Jogo } from '../../models/jogo.model';

@Component({
  selector: 'app-jogos',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './jogos.component.html',
})
export class JogosComponent implements OnInit {
  jogos: Jogo[] = [];

  constructor(
    private jogoService: JogoService,
    private participanteService: ParticipanteService,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.carregar();
  }

  private carregar() {
  this.jogoService.listar().subscribe(jogos => {
    jogos.forEach(j =>
      j.participantes = this.participanteService.listarPorJogo(+j.id!) // +j.id! → string>number
    );
    this.jogos = jogos;
  });
}


  novo() {
    this.router.navigate(['/jogos/novo']);
  }

  editar(id: string) {
    this.router.navigate(['/jogos/editar', id]);
  }

  remover(id: string) {
    if (confirm('Deseja remover este jogo?')) {
      this.jogoService.remover(id).then(() => this.carregar());
    }
  }

  logout() {
    this.authService.logout();
  }
}


