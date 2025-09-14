import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { JogoService } from '../../services/jogo.service';
import { ParticipanteService } from '../../services/participante.service';
import { Jogo } from '../../models/jogo.model';
import { FirebaseAuthService } from '../../services/firebase-auth.service'; // 1. MUDAR/ADICIONAR a importação

@Component({
  selector: 'app-jogos',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './jogos.component.html',
})
export class JogosComponent implements OnInit {
  jogos: Jogo[] = [];
  userId: string | null = null; // 2. CRIAR a propriedade para o ID do usuário

  constructor(
    private jogoService: JogoService,
    private participanteService: ParticipanteService,
    private router: Router,
    private authService: FirebaseAuthService // 3. MUDAR para FirebaseAuthService
  ) {}

  ngOnInit(): void {
    // 4. PEGAR o ID do usuário logado ao iniciar
    this.userId = this.authService.auth.currentUser?.uid || null;
    this.carregar();
  }

  private carregar() {
    this.jogoService.listar().subscribe(jogos => {
      jogos.forEach(j =>
        this.participanteService.listarPorJogo(j.id!).subscribe(ps => j.participantes = ps)
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
    // Se o logout estiver no FirebaseAuthService, mantenha authService.logout().
    // Se estiver em outro serviço, ajuste conforme necessário.
    this.authService.logout();
  }
}