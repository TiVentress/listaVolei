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
  jogoId!: number;
  nome = '';
  participantes: Participante[] = [];
  filtroNome: string = '';


  constructor(
    private participanteService: ParticipanteService,
    private route: ActivatedRoute
  ) {
    this.jogoId = Number(this.route.snapshot.paramMap.get('id'));
    this.carregar();
  }

  carregar() {
    this.participantes = this.participanteService.listarPorJogo(this.jogoId);
  }

  adicionar() {
    if (this.nome.trim()) {
      this.participanteService.adicionar({
        nome: this.nome,
        jogoId: this.jogoId,
        confirmado: false,
      });
      this.nome = '';
      this.carregar();
    }
  }

  remover(id: number) {
    this.participanteService.remover(id);
    this.carregar();
  }

  alternarConfirmacao(p: Participante) {
    p.confirmado
      ? this.participanteService.desconfirmar(p.id)
      : this.participanteService.confirmar(p.id);
    this.carregar();
  }

  get participantesFiltrados(): Participante[] {
  return this.participantes.filter(p =>
    p.nome.toLowerCase().includes(this.filtroNome.toLowerCase())
  );
  }
}
