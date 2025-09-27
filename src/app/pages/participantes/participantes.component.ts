import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ParticipanteService } from '../../services/participante.service';
import { Participante } from '../../models/participante.model';
import { JogoService } from '../../services/jogo.service';
import { AuthService } from '../../services/auth.service';
import { UserService, AppUser } from '../../services/user.service';
import { NotificationService } from '../../services/notification.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-participantes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './participantes.component.html',
})
export class ParticipantesComponent implements OnInit {
  jogoId!: string;
  jogoCreatorId: string | null = null;
  currentUserId: string | null = null;
  isCreator = false;

  nome = '';
  filtroNome = '';
  participantes: Participante[] = [];
  listaDeEspera: Participante[] = [];

  constructor(
    private participanteService: ParticipanteService,
    private route: ActivatedRoute,
    private jogoService: JogoService,
    private authService: AuthService,
    private userService: UserService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.jogoId = this.route.snapshot.paramMap.get('id')!;
    this.authService.getCurrentUser().then(user => {
      this.currentUserId = user ? user.uid : null;
      this.verificarSeEhCriador();
    });
    this.carregarDados();
  }

  carregarDados() {
    this.participanteService
      .listarPorJogo(this.jogoId)
      .subscribe(ps => (this.participantes = ps));

    this.participanteService
      .listarListaDeEspera(this.jogoId)
      .subscribe(ps => (this.listaDeEspera = ps));

    this.jogoService.obterPorId(this.jogoId).subscribe(jogo => {
      this.jogoCreatorId = jogo.creatorId || null;
      this.verificarSeEhCriador();
    });
  }

  verificarSeEhCriador() {
    if (this.currentUserId && this.jogoCreatorId) {
      this.isCreator = this.currentUserId === this.jogoCreatorId;
    }
  }

  async mostrarDetalhes(participante: Participante) {
    console.log('Dados do participante clicado:', participante);
    if (!participante.id) {
      this.notificationService.showError("Este participante não possui um ID válido.");
      return;
    }
    try {
      const userProfile = await this.userService.getUserProfile(participante.id);
      if (userProfile.exists()) {
        const userData = userProfile.data() as AppUser;
        Swal.fire({
          title: `<strong>${userData.nome}</strong>`,
          icon: 'info',
          html: `
            <p class="text-start ps-3"><strong>Email:</strong> ${userData.email}</p>
            <p class="text-start ps-3"><strong>Celular:</strong> ${userData.celular || 'Não informado'}</p>
          `,
          showCloseButton: true,
          focusConfirm: false,
          confirmButtonText: 'Fechar',
        });
      } else {
        this.notificationService.showError("Perfil do participante não encontrado.");
      }
    } catch (error) {
      this.notificationService.showError("Ocorreu um erro ao buscar os detalhes.");
    }
  }

  get participantesFiltrados() {
    return this.participantes.filter(p =>
      p.nome.toLowerCase().includes(this.filtroNome.toLowerCase())
    );
  }

  get listaDeEsperaFiltrada() {
    return this.listaDeEspera.filter(p =>
      p.nome.toLowerCase().includes(this.filtroNome.toLowerCase())
    );
  }

  adicionar() {
    if (this.nome.trim()) {
      this.participanteService.adicionar(this.jogoId, {
        nome: this.nome,
        presencaConfirmada: false,
      });
      this.nome = '';
    }
  }

  alternarConfirmacao(p: Participante) {
    p.presencaConfirmada
      ? this.participanteService.desconfirmar(this.jogoId, p.id!)
      : this.participanteService.confirmar(this.jogoId, p.id!);
  }

  remover(id: string) {
    this.participanteService.remover(this.jogoId, id);
  }
}