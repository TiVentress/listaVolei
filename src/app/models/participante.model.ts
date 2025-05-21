export interface Participante {
  id: number;
  nome: string;
  jogoId: number; // relacionamento com Jogo
  confirmado: boolean;
}
