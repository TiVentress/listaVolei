import { Injectable } from '@angular/core';
import { Participante } from '../models/participante.model';

@Injectable({ providedIn: 'root' })
export class ParticipanteService {
  private participantes: Participante[] = [];
  private idAtual = 1;

  listarPorJogo(jogoId: number): Participante[] {
    return this.participantes.filter(p => p.jogoId === jogoId);
  }

  adicionar(participante: Omit<Participante, 'id'>) {
    this.participantes.push({ ...participante, id: this.idAtual++ });
  }

  remover(id: number) {
    this.participantes = this.participantes.filter(p => p.id !== id);
  }

  confirmar(id: number) {
    const p = this.participantes.find(p => p.id === id);
    if (p) p.confirmado = true;
  }

  desconfirmar(id: number) {
    const p = this.participantes.find(p => p.id === id);
    if (p) p.confirmado = false;
  }
}
