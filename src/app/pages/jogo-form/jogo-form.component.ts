import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { JogoService } from '../../services/jogo.service';
import { Jogo } from '../../models/jogo.model';

@Component({
  selector: 'app-jogo-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './jogo-form.component.html',
})
export class JogoFormComponent {
  jogo: Partial<Jogo> = {
    data: '',
    hora: '',
    local: '',
  };

  dataAtual: string = new Date().toISOString().split('T')[0];

  editando = false;
  idEditando: number | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private jogoService: JogoService
  ) {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.editando = true;
      this.idEditando = Number(id);
      const jogoExistente = this.jogoService.obterPorId(this.idEditando);
      if (jogoExistente) {
        this.jogo = { ...jogoExistente };
      }
    }
  }

  salvar() {
    if (this.editando && this.idEditando !== null) {
      this.jogoService.editar(this.idEditando, this.jogo);
    } else {
      this.jogoService.adicionar(this.jogo as Omit<Jogo, 'id'>);
    }
    this.router.navigate(['/jogos']);
  }

  cancelar() {
    this.router.navigate(['/jogos']);
  }
}
