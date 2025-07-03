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
  // formulário em branco
  jogo: Partial<Jogo> = { data: '', hora: '', local: '' };

  dataAtual = new Date().toISOString().split('T')[0];

  editando = false;
  idEditando: string | null = null;           // ← agora string

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private jogoService: JogoService
  ) {
    const id = this.route.snapshot.paramMap.get('id'); // string
    if (id) {
      this.editando = true;
      this.idEditando = id;

      // obterPorId devolve Observable → subscribe
      this.jogoService.obterPorId(id).subscribe(j => {
        if (j) this.jogo = j;
      });
    }
  }

  salvar() {
    if (this.editando && this.idEditando) {
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
