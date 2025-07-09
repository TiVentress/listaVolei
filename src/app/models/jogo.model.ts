import { Participante } from './participante.model';

// src/app/models/jogo.model.ts
export interface Jogo {
  id?: string;
  data: string;
  hora: string;
  local: string;
  imagemUrl?: string;
  maxParticipantes: number;
  status: 'Aberto' | 'Lotado' | 'Cancelado';
  participantes?: Participante[];
}

