import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ParticipanteService } from '../../services/participante.service';
import { Participante } from '../../models/participante.model';
import { JogoService } from '../../services/jogo.service';
import { AuthService } from '../../services/auth.service';
import { UserService, AppUser } from '../../services/user.service';
import { NotificationService } from '../../services/notification.service';
import Swal from 'sweetalert2';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-participantes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './participantes.component.html',
  styleUrl: './participantes.component.css'
})
export class ParticipantesComponent implements OnInit {
  jogoId!: string;
  isCreator = false;
  isLoading = true;
  nome = '';
  filtroNome = '';
  participantes: Participante[] = [];
  listaDeEspera: Participante[] = [];

  constructor(
    private participanteService: ParticipanteService,
    private route: ActivatedRoute,
    private router: Router,
    private jogoService: JogoService,
    private authService: AuthService,
    private userService: UserService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.jogoId = this.route.snapshot.paramMap.get('id')!;
    this.carregarTudo();
  }

  async carregarTudo() {
    this.isLoading = true;
    try {
      const currentUser = await this.authService.getCurrentUser();
      if (!currentUser) {
        this.notificationService.showError("Você precisa estar logado para ver os participantes.");
        this.router.navigate(['/login']);
        return;
      }

      const jogo = await firstValueFrom(this.jogoService.obterPorId(this.jogoId));

      if (!jogo) {
        this.notificationService.showError("Jogo não encontrado.");
        this.router.navigate(['/meus-jogos']);
        return;
      }

      this.isCreator = jogo.creatorId === currentUser.uid;

      const participantesPromise = firstValueFrom(this.participanteService.listarPorJogo(this.jogoId));
      const listaDeEsperaPromise = firstValueFrom(this.participanteService.listarListaDeEspera(this.jogoId));
      
      const [participantes, listaDeEspera] = await Promise.all([participantesPromise, listaDeEsperaPromise]);

      this.participantes = participantes;
      this.listaDeEspera = listaDeEspera;

    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      this.notificationService.showError("Falha ao carregar os detalhes do jogo.");
    } finally {
      this.isLoading = false;
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

  async alternarConfirmacao(p: Participante) {
    if (!p.id) return;

    const estavaConfirmado = p.presencaConfirmada;
    const acao = estavaConfirmado ? 'desconfirmar' : 'confirmar';
    const acaoVerbo = estavaConfirmado ? 'desconfirmada' : 'confirmada';

    try {
      if (estavaConfirmado) {
        await this.participanteService.desconfirmar(this.jogoId, p.id);
      } else {
        await this.participanteService.confirmar(this.jogoId, p.id);
      }

      p.presencaConfirmada = !estavaConfirmado;

      this.notificationService.showSuccess(`Presença ${acaoVerbo} para ${p.nome}!`);

    } catch (error) {
      console.error(`Erro ao ${acao} presença:`, error);
      this.notificationService.showError(`Ocorreu um erro ao ${acao} a presença.`);
      p.presencaConfirmada = estavaConfirmado;
    }
  }

  remover(id: string) {
    Swal.fire({
      title: 'Tem certeza?',
      text: "Deseja remover este participante?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sim, remover!',
      cancelButtonText: 'Cancelar'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await this.participanteService.remover(this.jogoId, id);

          this.participantes = this.participantes.filter(par => par.id !== id);
          this.listaDeEspera = this.listaDeEspera.filter(par => par.id !== id);

          this.notificationService.showSuccess('Participante removido com sucesso.');

        } catch (error) {
          console.error("Erro ao remover participante:", error);
          this.notificationService.showError('Ocorreu um erro ao remover o participante.');
        }
      }
    });
  }

  async mostrarDetalhes(participante: Participante) {
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
}