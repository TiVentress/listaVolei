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
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Participante } from '../models/participante.model';

@Injectable({ providedIn: 'root' })
export class ParticipanteService {
  // Já não precisamos de uma referência única, pois ela dependerá do jogo.
  // private participantesRef!: CollectionReference;

  constructor(private firestore: Firestore) {
    // O construtor agora fica mais simples.
  }

  // Função auxiliar para obter a referência da subcoleção dinamicamente
  private getParticipantesRef(jogoId: string): CollectionReference<DocumentData> {
    return collection(this.firestore, `jogos/${jogoId}/participantes`);
  }

  // O método listar agora fica mais simples, sem a necessidade do 'where'.
  listarPorJogo(jogoId: string): Observable<Participante[]> {
    const participantesRef = this.getParticipantesRef(jogoId);
    return collectionData(participantesRef, { idField: 'id' }) as Observable<Participante[]>;
  }

  // O método adicionar agora precisa do jogoId para saber onde guardar o participante.
  adicionar(jogoId: string, p: Omit<Participante, 'id' | 'jogoId'>) {
    const participantesRef = this.getParticipantesRef(jogoId);
    return addDoc(participantesRef, p);
  }

  // Os métodos de atualização e remoção agora precisam do jogoId e do participanteId.
  confirmar(jogoId: string, participanteId: string) {
    const docRef = doc(this.firestore, `jogos/${jogoId}/participantes/${participanteId}`);
    return updateDoc(docRef, { presencaConfirmada: true }); // Corrigido para o nome do campo na sua função
  }

  desconfirmar(jogoId: string, participanteId: string) {
    const docRef = doc(this.firestore, `jogos/${jogoId}/participantes/${participanteId}`);
    return updateDoc(docRef, { presencaConfirmada: false }); // Corrigido para o nome do campo na sua função
  }

  remover(jogoId: string, participanteId: string) {
    const docRef = doc(this.firestore, `jogos/${jogoId}/participantes/${participanteId}`);
    return deleteDoc(docRef);
  }
}