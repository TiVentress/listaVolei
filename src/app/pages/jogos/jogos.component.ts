import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { JogoService } from '../../services/jogo.service';
import { ParticipanteService } from '../../services/participante.service';
import { Jogo } from '../../models/jogo.model';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';
import { Participante } from '../../models/participante.model';
import { User } from '@angular/fire/auth';

@Component({
  selector: 'app-jogos',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  providers: [DatePipe],
  templateUrl: './jogos.component.html',
})
export class JogosComponent implements OnInit {
  jogosOriginais: Jogo[] = [];
  jogos: Jogo[] = [];
  currentUser: User | null = null;
  termoBusca: string = '';

  constructor(
    private jogoService: JogoService,
    private participanteService: ParticipanteService,
    private router: Router,
    private authService: AuthService, 
    private userService: UserService,
    private datePipe: DatePipe
  ) { }

  ngOnInit(): void {
    this.authService.getCurrentUser().then(user => {
      this.currentUser = user;
    });
    this.carregar();
  }

  private carregar() {
    this.jogoService.listar().subscribe(jogos => {
      jogos.forEach(j => {
        this.participanteService.listarPorJogo(j.id!).subscribe(ps => j.participantes = ps);
        this.participanteService.listarListaDeEspera(j.id!).subscribe(lista => j.listaDeEspera = lista);
      });
      this.jogosOriginais = jogos;
      this.jogos = jogos;
    });
  }

  aplicarFiltros() {
    const termo = this.termoBusca.toLowerCase();
    if (!termo) {
      this.jogos = this.jogosOriginais;
      return;
    }
    this.jogos = this.jogosOriginais.filter(jogo => {
      const localCorresponde = jogo.local.toLowerCase().includes(termo);
      const dataFormatada = this.datePipe.transform(jogo.data, 'dd/MM/yyyy') || '';
      const dataCorresponde = dataFormatada.includes(termo);
      return localCorresponde || dataCorresponde;
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
      this.jogoService.remover(id);
    }
  }

  logout() {
    this.authService.logout();
  }

  isParticipante(jogo: Jogo): boolean {
    if (!this.currentUser || !jogo.participantes) { return false; }
    return jogo.participantes.some(p => p.id === this.currentUser!.uid);
  }

  async entrarNoJogo(jogo: Jogo) {
    if (!this.currentUser) { alert("Erro: Não foi possível identificar o usuário."); return; }
    if (jogo.participantes && jogo.participantes.length >= jogo.maxParticipantes) { alert("Desculpe, este jogo já está lotado."); return; }
    try {
      const userProfile = await this.userService.getUserProfile(this.currentUser.uid);
      if (!userProfile.exists()) { alert("Erro: Perfil de usuário não encontrado."); return; }
      const nomeAtualizado = userProfile.data()['nome'];
      const novoParticipante: Participante = { id: this.currentUser.uid, nome: nomeAtualizado, presencaConfirmada: false };
      await this.participanteService.inscreverUsuario(jogo.id!, novoParticipante);
    } catch (err) {
      console.error("Erro ao se inscrever no jogo:", err);
      alert('Ocorreu um erro ao se inscrever no jogo.');
    }
  }

  sairDoJogo(jogo: Jogo) {
    if (!this.currentUser) { alert("Erro: Não foi possível identificar o usuário."); return; }
    this.participanteService.cancelarInscricao(jogo.id!, this.currentUser.uid)
      .catch(err => console.error("Erro ao cancelar inscrição:", err));
  }

  isInListaDeEspera(jogo: Jogo): boolean {
    if (!this.currentUser || !jogo.listaDeEspera) { return false; }
    return jogo.listaDeEspera.some(p => p.id === this.currentUser!.uid);
  }

  async entrarNaListaDeEspera(jogo: Jogo) {
    if (!this.currentUser) { alert("Erro: Não foi possível identificar o usuário."); return; }
    try {
      const userProfile = await this.userService.getUserProfile(this.currentUser.uid);
      if (!userProfile.exists()) { alert("Erro: Perfil de usuário não encontrado."); return; }
      const nomeAtualizado = userProfile.data()['nome'];
      const participante: Participante = { id: this.currentUser.uid, nome: nomeAtualizado, presencaConfirmada: false };
      await this.participanteService.entrarNaListaDeEspera(jogo.id!, participante);
    } catch (err) {
      console.error("Erro ao entrar na lista de espera:", err);
      alert('Ocorreu um erro ao entrar na lista de espera.');
    }
  }

  sairDaListaDeEspera(jogo: Jogo) {
    if (!this.currentUser) { alert("Erro: Não foi possível identificar o usuário."); return; }
    this.participanteService.sairDaListaDeEspera(jogo.id!, this.currentUser.uid)
      .catch(err => console.error("Erro ao sair da lista de espera:", err));
  }
}