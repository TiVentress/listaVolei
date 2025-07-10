import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ParticipanteService } from '../../services/participante.service';
import { Participante } from '../../models/participante.model';

@Component({
  selector: 'app-participantes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './participantes.component.html',
})
export class ParticipantesComponent {
  jogoId!: string;
  nome = '';
  filtroNome = '';
  participantes: Participante[] = [];

  constructor(
    private participanteService: ParticipanteService,
    private route: ActivatedRoute
  ) {
    this.jogoId = this.route.snapshot.paramMap.get('id')!;
    this.carregar();
  }

  carregar() {
    this.participanteService
      .listarPorJogo(this.jogoId)
      .subscribe(ps => (this.participantes = ps));
  }

  get participantesFiltrados() {
    return this.participantes.filter(p =>
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
