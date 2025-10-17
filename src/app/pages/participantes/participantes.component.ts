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
import { firstValueFrom } from 'rxjs'; // 1. Importar o firstValueFrom

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

  // 2. Lógica de carregamento refatorada para ser mais robusta
  async carregarTudo() {
    this.isLoading = true;
    try {
      const currentUser = await this.authService.getCurrentUser();
      if (!currentUser) {
        this.notificationService.showError("Você precisa estar logado para ver os participantes.");
        this.router.navigate(['/login']);
        return;
      }

      // Converte o observable para uma promise que resolve com o primeiro valor
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
      // 3. O 'finally' garante que o loader SEMPRE será desligado
      this.isLoading = false;
    }
  }
  
  // O restante dos seus métodos permanece igual
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