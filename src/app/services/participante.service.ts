import { Injectable } from '@angular/core';
import {
  Firestore,
  collection,
  collectionData,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
  CollectionReference,
  DocumentData,
  setDoc // 1. IMPORTAR 'setDoc'
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Participante } from '../models/participante.model';

@Injectable({ providedIn: 'root' })
export class ParticipanteService {

  constructor(private firestore: Firestore) {}

  private getParticipantesRef(jogoId: string): CollectionReference<DocumentData> {
    return collection(this.firestore, `jogos/${jogoId}/participantes`);
  }

  listarPorJogo(jogoId: string): Observable<Participante[]> {
    const participantesRef = this.getParticipantesRef(jogoId);
    return collectionData(participantesRef, { idField: 'id' }) as Observable<Participante[]>;
  }

  adicionar(jogoId: string, p: Omit<Participante, 'id' | 'jogoId'>) {
    const participantesRef = this.getParticipantesRef(jogoId);
    return addDoc(participantesRef, p);
  }

  confirmar(jogoId: string, participanteId: string) {
    const docRef = doc(this.firestore, `jogos/${jogoId}/participantes/${participanteId}`);
    return updateDoc(docRef, { presencaConfirmada: true });
  }

  desconfirmar(jogoId: string, participanteId: string) {
    const docRef = doc(this.firestore, `jogos/${jogoId}/participantes/${participanteId}`);
    return updateDoc(docRef, { presencaConfirmada: false });
  }

  remover(jogoId: string, participanteId: string) {
    const docRef = doc(this.firestore, `jogos/${jogoId}/participantes/${participanteId}`);
    return deleteDoc(docRef);
  }

  // ===============================================================
  // 2. ADICIONAR OS DOIS NOVOS MÉTODOS ABAIXO
  // ===============================================================

  /**
   * Inscreve um usuário em um jogo.
   * Usa o ID do usuário como ID do documento para evitar duplicatas.
   * @param jogoId O ID do jogo no qual se inscrever.
   * @param participante O objeto do participante (incluindo seu ID e nome).
   */
  inscreverUsuario(jogoId: string, participante: Participante) {
    // Cria uma referência para o documento do participante usando o ID do próprio usuário.
    // Ex: /jogos/ID_DO_JOGO/participantes/ID_DO_USUARIO
    const pDoc = doc(this.firestore, `jogos/${jogoId}/participantes/${participante.id}`);
    
    // setDoc cria ou sobrescreve o documento. Isso garante que o usuário
    // só possa se inscrever uma vez, pois o ID do documento é fixo (seu UID).
    return setDoc(pDoc, participante);
  }

  /**
   * Remove a inscrição de um usuário de um jogo.
   * @param jogoId O ID do jogo do qual sair.
   * @param participanteId O ID do usuário a ser removido (seu próprio UID).
   */
  cancelarInscricao(jogoId: string, participanteId: string) {
    const pDoc = doc(this.firestore, `jogos/${jogoId}/participantes/${participanteId}`);
    return deleteDoc(pDoc);
  }
}