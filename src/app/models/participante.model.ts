export interface Participante {
  id?: string;          // id gerado pelo Firestore
  nome: string;
  confirmado: boolean;
  jogoId: string;       // referência ao jogo
}