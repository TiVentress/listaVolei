import { Injectable } from '@angular/core';
import { Jogo } from '../models/jogo.model';

@Injectable({
  providedIn: 'root'
})
export class JogoService {
  private jogos: Jogo[] = [];
  private proximoId = 1;

  listar(): Jogo[] {
    return this.jogos;
  }

  adicionar(jogo: Omit<Jogo, 'id'>): void {
    const novoJogo: Jogo = { id: this.proximoId++, ...jogo };
    this.jogos.push(novoJogo);
  }

  editar(id: number, dados: Partial<Jogo>): void {
    const jogo = this.jogos.find(j => j.id === id);
    if (jogo) Object.assign(jogo, dados);
  }

  remover(id: number): void {
    this.jogos = this.jogos.filter(j => j.id !== id);
  }

  obterPorId(id: number): Jogo | undefined {
    return this.jogos.find(j => j.id === id);
  }
}
