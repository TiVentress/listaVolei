import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { JogoService } from '../../services/jogo.service';
import { UploadService } from '../../services/upload.service';   // ← novo serviço
import { Jogo } from '../../models/jogo.model';

@Component({
  selector: 'app-jogo-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './jogo-form.component.html',
})
export class JogoFormComponent {
  /** Dados do formulário */
  jogo: Partial<Jogo> = { data: '', hora: '', local: '' };

  /** Controle de edição / criação */
  editando = false;
  idEditando: string | null = null;

  /** Arquivo escolhido para upload */
  arquivoSelecionado?: File;

  /** Data mínima para o campo Data */
  dataAtual = new Date().toISOString().split('T')[0];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private jogoService: JogoService,
    private uploadSrv: UploadService        // ← injetado
  ) {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.editando = true;
      this.idEditando = id;
      this.jogoService.obterPorId(id).subscribe(j => (this.jogo = j));
    }
  }

  /** Quando o usuário seleciona uma imagem */
  selecionarArquivo(evt: Event) {
    const file = (evt.target as HTMLInputElement).files?.[0];
    if (file) this.arquivoSelecionado = file;
  }

  /** Salva (cria ou edita) o jogo */
  async salvar() {
    try {
      // 1. Se houver arquivo, faz upload e obtém URL
      if (this.arquivoSelecionado) {
        this.jogo.imagemUrl = await this.uploadSrv.enviarImagem(this.arquivoSelecionado);
      }

      // 2. Grava no Firestore
      if (this.editando && this.idEditando) {
        await this.jogoService.editar(this.idEditando, this.jogo);
      } else {
        await this.jogoService.adicionar(this.jogo as Omit<Jogo, 'id'>);
      }

      // 3. Volta para lista
      this.router.navigate(['/jogos']);
    } catch (e) {
      console.error('Falha ao salvar:', e);
      alert('Erro ao salvar (veja console).');
    }
  }

  cancelar() {
    this.router.navigate(['/jogos']);
  }
}
