import { Participante } from './participante.model';

// src/app/models/jogo.model.ts
export interface Jogo {
  id?: string;
  data: string;
  hora: string;
  local: string;
  imagemUrl?: string;
  participantes?: Participante[];   // <- adicionado
}

