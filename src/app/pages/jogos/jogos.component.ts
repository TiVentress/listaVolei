import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { JogoService } from '../../services/jogo.service';
import { ParticipanteService } from '../../services/participante.service';
import { Jogo } from '../../models/jogo.model';
import { FirebaseAuthService } from '../../services/firebase-auth.service';
import { Participante } from '../../models/participante.model';

@Component({
  selector: 'app-jogos',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './jogos.component.html',
})
export class JogosComponent implements OnInit {
  jogos: Jogo[] = [];
  userId: string | null = null;

  constructor(
    private jogoService: JogoService,
    private participanteService: ParticipanteService,
    private router: Router,
    private authService: FirebaseAuthService
  ) { }

  ngOnInit(): void {
    this.userId = this.authService.auth.currentUser?.uid || null;
    this.carregar();
  }

  private carregar() {
    this.jogoService.listar().subscribe(jogos => {
      jogos.forEach(j => {
        this.participanteService.listarPorJogo(j.id!).subscribe(ps => j.participantes = ps);
        this.participanteService.listarListaDeEspera(j.id!).subscribe(lista => j.listaDeEspera = lista);
      });
      this.jogos = jogos;
    });
  }

  novo() { this.router.navigate(['/jogos/novo']); }
  editar(id: string) { this.router.navigate(['/jogos/editar', id]); }
  remover(id: string) { if (confirm('Deseja remover este jogo?')) { this.jogoService.remover(id); } }
  logout() { this.authService.logout(); }
  isParticipante(jogo: Jogo): boolean { if (!this.userId || !jogo.participantes) { return false; } return jogo.participantes.some(p => p.id === this.userId); }
  entrarNoJogo(jogo: Jogo) { const user = this.authService.auth.currentUser; if (!user || !user.displayName || !user.uid) { alert("Erro: Não foi possível identificar o usuário."); return; } if (jogo.participantes && jogo.participantes.length >= jogo.maxParticipantes) { alert("Desculpe, este jogo já está lotado."); return; } const novoParticipante: Participante = { id: user.uid, nome: user.displayName, presencaConfirmada: false }; this.participanteService.inscreverUsuario(jogo.id!, novoParticipante).catch(err => console.error("Erro ao se inscrever no jogo:", err)); }
  sairDoJogo(jogo: Jogo) { if (!this.userId) { alert("Erro: Não foi possível identificar o usuário."); return; } this.participanteService.cancelarInscricao(jogo.id!, this.userId).catch(err => console.error("Erro ao cancelar inscrição:", err)); }

  isInListaDeEspera(jogo: Jogo): boolean {
    if (!this.userId || !jogo.listaDeEspera) {
      return false;
    }
    return jogo.listaDeEspera.some(p => p.id === this.userId);
  }

  entrarNaListaDeEspera(jogo: Jogo) {
    const user = this.authService.auth.currentUser;
    if (!user || !user.displayName || !user.uid) {
      alert("Erro: Não foi possível identificar o usuário.");
      return;
    }
    const participante: Participante = {
      id: user.uid,
      nome: user.displayName,
      presencaConfirmada: false
    };
    this.participanteService.entrarNaListaDeEspera(jogo.id!, participante)
      .catch(err => console.error("Erro ao entrar na lista de espera:", err));
  }

  sairDaListaDeEspera(jogo: Jogo) {
    if (!this.userId) {
      alert("Erro: Não foi possível identificar o usuário.");
      return;
    }
    this.participanteService.sairDaListaDeEspera(jogo.id!, this.userId)
      .catch(err => console.error("Erro ao sair da lista de espera:", err));
  }
}