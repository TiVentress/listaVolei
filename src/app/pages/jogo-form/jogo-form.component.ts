import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { JogoService } from '../../services/jogo.service';
import { UploadService } from '../../services/upload.service';
import { Jogo } from '../../models/jogo.model';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-jogo-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './jogo-form.component.html',
  styleUrl: './jogo-form.component.css'
})
export class JogoFormComponent {
  jogo: Partial<Jogo> = {
    local: '',
    data: '',
    hora: '',
    imagemUrl: '',
    maxParticipantes: 14,
    status: 'Aberto'
  };

  editando = false;
  idEditando: string | null = null;
  arquivoSelecionado?: File;
  dataAtual = new Date().toISOString().split('T')[0];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private jogoService: JogoService,
    private uploadSrv: UploadService,
    private authService: AuthService,
    private notificationService: NotificationService
  ) {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.editando = true;
      this.idEditando = id;
      this.jogoService.obterPorId(id).subscribe(j => (this.jogo = j));
    }
  }

  selecionarArquivo(evt: Event) {
    const file = (evt.target as HTMLInputElement).files?.[0];
    if (file) {
      this.arquivoSelecionado = file;
    }
  }

  async salvar() {
    try {
      if (this.arquivoSelecionado) {
        this.jogo.imagemUrl = await this.uploadSrv.enviarImagem(this.arquivoSelecionado);
      }

      const currentUser = await this.authService.getCurrentUser();
      if (!currentUser) {
        this.notificationService.showError('Você precisa estar logado para criar um jogo.');
        return;
      }
      
      if (!this.editando) {
        this.jogo.creatorId = currentUser.uid;
      }

      if (this.editando && this.idEditando) {
        await this.jogoService.editar(this.idEditando, this.jogo);
      } else {
        this.jogo.status = 'Aberto';
        await this.jogoService.adicionar(this.jogo as Omit<Jogo, 'id'>);
      }
      
      this.notificationService.showSuccess('Jogo salvo com sucesso!');
      this.router.navigate(['/jogos']);

    } catch (e) {
      console.error('Falha ao salvar:', e);
      this.notificationService.showError('Ocorreu um erro ao salvar o jogo.');
    }
  }

  cancelar() {
    this.router.navigate(['/jogos']);
  }
}