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
  jogo: Partial<Jogo> = { data: '', hora: '', local: '' };

  editando = false;
  idEditando: string | null = null;

  arquivoSelecionado?: File;

  dataAtual = new Date().toISOString().split('T')[0];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private jogoService: JogoService,
    private uploadSrv: UploadService        
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
    if (file) this.arquivoSelecionado = file;
  }

  async salvar() {
    try {
      if (this.arquivoSelecionado) {
        this.jogo.imagemUrl = await this.uploadSrv.enviarImagem(this.arquivoSelecionado);
      }

      if (this.editando && this.idEditando) {
        await this.jogoService.editar(this.idEditando, this.jogo);
      } else {
        await this.jogoService.adicionar(this.jogo as Omit<Jogo, 'id'>);
      }

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
