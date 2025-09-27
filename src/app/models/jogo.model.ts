import { Participante } from './participante.model';
export interface Jogo {
  id?: string;
  data: string;
  hora: string;
  local: string;
  endereco?: string;
  tipo?: 'Quadra' | 'Areia';
  imagemUrl?: string;
  maxParticipantes: number;
  status: 'Aberto' | 'Lotado' | 'Cancelado';
  participantes?: Participante[];
  creatorId?: string;
  descricao?: string;
  listaDeEspera?: Participante[];
}