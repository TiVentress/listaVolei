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
  setDoc
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Participante } from '../models/participante.model';

@Injectable({ providedIn: 'root' })
export class ParticipanteService {

  constructor(private firestore: Firestore) {}

  // --- MÉTODOS EXISTENTES PARA PARTICIPANTES CONFIRMADOS ---

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

  inscreverUsuario(jogoId: string, participante: Participante) {
    const pDoc = doc(this.firestore, `jogos/${jogoId}/participantes/${participante.id}`);
    return setDoc(pDoc, participante);
  }

  cancelarInscricao(jogoId: string, participanteId: string) {
    const pDoc = doc(this.firestore, `jogos/${jogoId}/participantes/${participanteId}`);
    return deleteDoc(pDoc);
  }

  // ===============================================================
  // NOVOS MÉTODOS PARA A LISTA DE ESPERA
  // ===============================================================

  private getListaDeEsperaRef(jogoId: string): CollectionReference<DocumentData> {
    return collection(this.firestore, `jogos/${jogoId}/listaDeEspera`);
  }

  /**
   * Lista todos os usuários na lista de espera de um jogo.
   */
  listarListaDeEspera(jogoId: string): Observable<Participante[]> {
    const listaDeEsperaRef = this.getListaDeEsperaRef(jogoId);
    return collectionData(listaDeEsperaRef, { idField: 'id' }) as Observable<Participante[]>;
  }

  /**
   * Adiciona o usuário logado à lista de espera de um jogo.
   */
  entrarNaListaDeEspera(jogoId: string, participante: Participante) {
    const pDoc = doc(this.firestore, `jogos/${jogoId}/listaDeEspera/${participante.id}`);
    return setDoc(pDoc, participante);
  }

  /**
   * Remove o usuário logado da lista de espera de um jogo.
   */
  sairDaListaDeEspera(jogoId: string, participanteId: string) {
    const pDoc = doc(this.firestore, `jogos/${jogoId}/listaDeEspera/${participanteId}`);
    return deleteDoc(pDoc);
  }
}