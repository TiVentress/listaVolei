export interface Participante {
  id?: string;
  nome: string;
  jogoId?: string; // Este campo já não é guardado na base de dados, mas pode ser útil no front-end.
  presencaConfirmada: boolean; // CORRIGIDO: de 'confirmado' para 'presencaConfirmada'
}