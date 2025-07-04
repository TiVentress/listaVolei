import { Injectable } from '@angular/core';
import {
  Firestore,
  collection,
  collectionData,
  query,
  where,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
  CollectionReference,
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Participante } from '../models/participante.model';

@Injectable({ providedIn: 'root' })
export class ParticipanteService {
  private participantesRef!: CollectionReference; 

  constructor(private firestore: Firestore) {
    this.participantesRef = collection(this.firestore, 'participantes');
  }

  listarPorJogo(jogoId: string): Observable<Participante[]> {
    const q = query(this.participantesRef, where('jogoId', '==', jogoId));
    return collectionData(q, { idField: 'id' }) as Observable<Participante[]>;
  }

  adicionar(p: Omit<Participante, 'id'>) {
    return addDoc(this.participantesRef, p);
  }

  confirmar(id: string) {
    return updateDoc(doc(this.firestore, `participantes/${id}`), { confirmado: true });
  }

  desconfirmar(id: string) {
    return updateDoc(doc(this.firestore, `participantes/${id}`), { confirmado: false });
  }

  remover(id: string) {
    return deleteDoc(doc(this.firestore, `participantes/${id}`));
  }
}
