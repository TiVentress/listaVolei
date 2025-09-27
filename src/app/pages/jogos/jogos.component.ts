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
    private notificationService: NotificationService,
    private datePipe: DatePipe,
    private route: ActivatedRoute, 
    private viewportScroller: ViewportScroller
  ) { }

  ngOnInit(): void {
    this.authService.getCurrentUser().then(user => {
      this.currentUser = user;
    });
    this.carregar();
  }

  private carregar() {
  this.jogoService.listar().subscribe(jogos => {
    // Seu código original para carregar os participantes
    jogos.forEach(j => {
      this.participanteService.listarPorJogo(j.id!).subscribe(ps => j.participantes = ps);
      this.participanteService.listarListaDeEspera(j.id!).subscribe(lista => j.listaDeEspera = lista);
    });
    this.jogosOriginais = jogos;
    this.jogos = jogos;

    // --- NOVA LÓGICA DE ROLAGEM ADICIONADA AQUI ---
    // Após os jogos serem carregados, verificamos se há um "fragmento" na URL
    this.route.fragment.pipe(first()).subscribe(fragment => {
      if (fragment) {
        // Usamos um pequeno timeout para garantir que o *ngFor terminou de renderizar na tela
        setTimeout(() => this.viewportScroller.scrollToAnchor(fragment), 100);
      }
    });
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

  novo() { this.router.navigate(['/jogos/novo']); }
  editar(id: string) { this.router.navigate(['/jogos/editar', id]); }

  async remover(id: string) {
    const confirmou = await this.notificationService.showConfirmation(
      'Você tem certeza?',
      'Esta ação não pode ser desfeita!',
      'Sim, quero remover'
    );
    if (confirmou) {
      try {
        await this.jogoService.remover(id);
        this.notificationService.showSuccess('Jogo removido com sucesso!');
      } catch (error) {
        this.notificationService.showError('Ocorreu um erro ao remover o jogo.');
        console.error("Erro ao remover o jogo:", error);
      }
    }
  }

  logout() { this.authService.logout(); }

  isParticipante(jogo: Jogo): boolean {
    if (!this.currentUser || !jogo.participantes) { return false; }
    return jogo.participantes.some(p => p.id === this.currentUser!.uid);
  }

  async entrarNoJogo(jogo: Jogo) {
    if (!this.currentUser) { this.notificationService.showError("Você precisa estar logado para realizar esta ação."); return; }
    if (jogo.participantes && jogo.participantes.length >= jogo.maxParticipantes) { this.notificationService.showError("Desculpe, este jogo já está lotado."); return; }
    try {
      const userProfile = await this.userService.getUserProfile(this.currentUser.uid);
      if (!userProfile.exists()) { this.notificationService.showError("Erro: Perfil de usuário não encontrado."); return; }
      
      const nomeAtualizado = userProfile.data()['nome'];
      const novoParticipante: Participante = { id: this.currentUser.uid, nome: nomeAtualizado, presencaConfirmada: false };
      
      await this.participanteService.inscreverUsuario(jogo.id!, novoParticipante);
      this.notificationService.showSuccess('Inscrição confirmada!');
    } catch (err) {
      console.error("Erro ao se inscrever no jogo:", err);
      this.notificationService.showError('Ocorreu um erro ao se inscrever no jogo.');
    }
  }

  async sairDoJogo(jogo: Jogo) {
    if (!this.currentUser) { this.notificationService.showError("Você precisa estar logado para realizar esta ação."); return; }
    try {
      await this.participanteService.cancelarInscricao(jogo.id!, this.currentUser.uid);
      this.notificationService.showSuccess('Sua inscrição foi cancelada.');
    } catch (err) {
      console.error("Erro ao cancelar inscrição:", err);
      this.notificationService.showError('Ocorreu um erro ao cancelar sua inscrição.');
    }
  }

  isInListaDeEspera(jogo: Jogo): boolean {
    if (!this.currentUser || !jogo.listaDeEspera) { return false; }
    return jogo.listaDeEspera.some(p => p.id === this.currentUser!.uid);
  }

  async entrarNaListaDeEspera(jogo: Jogo) {
    if (!this.currentUser) { this.notificationService.showError("Você precisa estar logado para realizar esta ação."); return; }
    try {
      const userProfile = await this.userService.getUserProfile(this.currentUser.uid);
      if (!userProfile.exists()) { this.notificationService.showError("Erro: Perfil de usuário não encontrado."); return; }
      
      const nomeAtualizado = userProfile.data()['nome'];
      const participante: Participante = { id: this.currentUser.uid, nome: nomeAtualizado, presencaConfirmada: false };
      
      await this.participanteService.entrarNaListaDeEspera(jogo.id!, participante);
      this.notificationService.showSuccess('Você entrou na lista de espera.');
    } catch (err) {
      console.error("Erro ao entrar na lista de espera:", err);
      this.notificationService.showError('Ocorreu um erro ao entrar na lista de espera.');
    }
  }

  async sairDaListaDeEspera(jogo: Jogo) {
    if (!this.currentUser) { this.notificationService.showError("Você precisa estar logado para realizar esta ação."); return; }
    try {
      await this.participanteService.sairDaListaDeEspera(jogo.id!, this.currentUser.uid);
      this.notificationService.showSuccess('Você saiu da lista de espera.');
    } catch (err) {
      console.error("Erro ao sair da lista de espera:", err);
      this.notificationService.showError('Ocorreu um erro ao sair da lista de espera.');
    }
  }
}