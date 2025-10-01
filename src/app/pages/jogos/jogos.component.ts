// Arquivo: src/app/pages/jogos/jogos.component.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe, ViewportScroller } from '@angular/common';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { JogoService } from '../../services/jogo.service';
import { ParticipanteService } from '../../services/participante.service';
import { Jogo } from '../../models/jogo.model';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';
import { Participante } from '../../models/participante.model';
import { User } from '@angular/fire/auth';
import { NotificationService } from '../../services/notification.service';
import { first } from 'rxjs';
import { Firestore, doc, updateDoc, arrayUnion, arrayRemove } from '@angular/fire/firestore';

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
  isLoading = true;

  constructor(
    private jogoService: JogoService,
    private participanteService: ParticipanteService,
    private router: Router,
    private authService: AuthService,
    public userService: UserService,
    private notificationService: NotificationService,
    private datePipe: DatePipe,
    private route: ActivatedRoute,
    private viewportScroller: ViewportScroller,
    private firestore: Firestore
  ) { }

  ngOnInit(): void {
    this.authService.getCurrentUser().then(user => {
      this.currentUser = user;
    });
    this.carregar();
  }

  // MÉTODO CARREGAR COM A LÓGICA FINAL
  private carregar() {
    this.isLoading = true;
    this.jogoService.listarTodos().subscribe(todosOsJogos => {
      todosOsJogos.forEach(j => {
        this.participanteService.listarPorJogo(j.id).subscribe(ps => j.participantes = ps);
        this.participanteService.listarListaDeEspera(j.id).subscribe(lista => j.listaDeEspera = lista);
      });

      this.jogosOriginais = todosOsJogos;
      const hoje = new Date().toISOString().split('T')[0];

      // Por padrão, exibe apenas os jogos futuros.
      let jogosParaExibir = this.jogosOriginais.filter(j => j.data >= hoje);

      this.route.fragment.pipe(first()).subscribe(fragment => {
        if (fragment) {
          const jogoId = fragment.replace('jogo-', '');
          const jogoAlvo = this.jogosOriginais.find(j => j.id === jogoId);
          
          // AQUI ESTÁ A MÁGICA:
          // Se o jogo alvo existe, mas não está na lista de exibição (porque é antigo),
          // nós o adicionamos temporariamente.
          if (jogoAlvo && !jogosParaExibir.some(j => j.id === jogoId)) {
            jogosParaExibir.push(jogoAlvo);
          }
          
          setTimeout(() => this.viewportScroller.scrollToAnchor(fragment), 300);
        }
        
        // Atribui a lista final (com o possível jogo antigo) à variável de exibição
        this.jogos = jogosParaExibir;
        this.isLoading = false;
      });
    });
  }

  aplicarFiltros() {
    const termo = this.termoBusca.toLowerCase();
    const hoje = new Date().toISOString().split('T')[0];
    let jogosParaFiltrar = this.jogosOriginais.filter(j => j.data >= hoje);

    if (termo) {
      jogosParaFiltrar = jogosParaFiltrar.filter(jogo => {
        const localCorresponde = jogo.local.toLowerCase().includes(termo);
        const dataFormatada = this.datePipe.transform(jogo.data, 'dd/MM/yyyy') || '';
        const dataCorresponde = dataFormatada.includes(termo);
        return localCorresponde || dataCorresponde;
      });
    }
    this.jogos = jogosParaFiltrar;
  }
  
  // O resto do seu componente permanece o mesmo.
  novo() { this.router.navigate(['/jogos/novo']); }
  editar(id: string) { this.router.navigate(['/jogos/editar', id]); }

  async remover(id: string) {
    const confirmou = await this.notificationService.showConfirmation('Você tem certeza?','Esta ação não pode ser desfeita!','Sim, quero remover');
    if (confirmou) {
      try {
        await this.jogoService.remover(id);
        this.notificationService.showSuccess('Jogo removido com sucesso!');
      } catch (error) {
        this.notificationService.showError('Ocorreu um erro ao remover o jogo.');
      }
    }
  }

  logout() { this.authService.logout(); }

  isParticipante(jogo: Jogo): boolean {
    if (!this.currentUser || !jogo.participantes) { return false; }
    return jogo.participantes.some(p => p.id === this.currentUser!.uid);
  }

  async entrarNoJogo(jogo: Jogo) {
    if (!this.currentUser || !jogo.id) { return; }
    if (jogo.participantes && jogo.participantes.length >= jogo.maxParticipantes) { this.notificationService.showError("Desculpe, este jogo já está lotado."); return; }
    try {
      const userProfile = await this.userService.getUserProfile(this.currentUser.uid);
      if (!userProfile.exists()) { this.notificationService.showError("Erro: Perfil de usuário não encontrado."); return; }
      const nomeAtualizado = userProfile.data()['nome'];
      const novoParticipante: Participante = { id: this.currentUser.uid, nome: nomeAtualizado, presencaConfirmada: false };
      await this.participanteService.inscreverUsuario(jogo.id, novoParticipante);
      const jogoRef = doc(this.firestore, 'jogos', jogo.id);
      await updateDoc(jogoRef, { participantesIds: arrayUnion(this.currentUser.uid) });
      this.notificationService.showSuccess('Inscrição confirmada!');
    } catch (err) {
      this.notificationService.showError('Ocorreu um erro ao se inscrever no jogo.');
    }
  }

  async sairDoJogo(jogo: Jogo) {
    if (!this.currentUser || !jogo.id) { return; }
    try {
      await this.participanteService.cancelarInscricao(jogo.id, this.currentUser.uid);
      const jogoRef = doc(this.firestore, 'jogos', jogo.id);
      await updateDoc(jogoRef, { participantesIds: arrayRemove(this.currentUser.uid) });
      this.notificationService.showSuccess('Sua inscrição foi cancelada.');
    } catch (err) {
      this.notificationService.showError('Ocorreu um erro ao cancelar sua inscrição.');
    }
  }

  isInListaDeEspera(jogo: Jogo): boolean {
    if (!this.currentUser || !jogo.listaDeEspera) { return false; }
    return jogo.listaDeEspera.some(p => p.id === this.currentUser!.uid);
  }

  async entrarNaListaDeEspera(jogo: Jogo) {
    if (!this.currentUser || !jogo.id) { return; }
    try {
      const userProfile = await this.userService.getUserProfile(this.currentUser.uid);
      if (!userProfile.exists()) { this.notificationService.showError("Erro: Perfil de usuário não encontrado."); return; }
      const nomeAtualizado = userProfile.data()['nome'];
      const participante: Participante = { id: this.currentUser.uid, nome: nomeAtualizado, presencaConfirmada: false };
      await this.participanteService.entrarNaListaDeEspera(jogo.id, participante);
      this.notificationService.showSuccess('Você entrou na lista de espera.');
    } catch (err) {
      this.notificationService.showError('Ocorreu um erro ao entrar na lista de espera.');
    }
  }

  async sairDaListaDeEspera(jogo: Jogo) {
    if (!this.currentUser || !jogo.id) { return; }
    try {
      await this.participanteService.sairDaListaDeEspera(jogo.id, this.currentUser.uid);
      this.notificationService.showSuccess('Você saiu da lista de espera.');
    } catch (err) {
      this.notificationService.showError('Ocorreu um erro ao sair da lista de espera.');
    }
  }
}