import { Injectable } from '@angular/core';
import {
  Firestore,
  collection,
  collectionData,
  doc,
  docData,
  addDoc,
  updateDoc,
  deleteDoc,
  CollectionReference,
  query,
  where,
  orderBy,
  getDocs
} from '@angular/fire/firestore';
import { Observable, map } from 'rxjs';
import { Jogo } from '../models/jogo.model';

@Injectable({ providedIn: 'root' })
export class JogoService {
  private jogosRef: CollectionReference;

  constructor(private firestore: Firestore) {
    this.jogosRef = collection(this.firestore, 'jogos');
  }

  listarTodos(): Observable<Jogo[]> {
    const q = query(this.jogosRef, orderBy('data', 'asc'));
    return collectionData(q, { idField: 'id' }) as Observable<Jogo[]>;
  }

  listar(): Observable<Jogo[]> {
    const hojeString = new Date().toISOString().split('T')[0];
    return this.listarTodos().pipe(
      map(jogos => jogos.filter(jogo => jogo.data >= hojeString).sort((a, b) => a.data.localeCompare(b.data)))
    );
  }

  getHistoricoJogos(): Observable<Jogo[]> {
    const hojeString = new Date().toISOString().split('T')[0];
    return this.listarTodos().pipe(
      map(jogos => jogos.filter(jogo => jogo.data < hojeString))
    );
  }

  obterPorId(id: string): Observable<Jogo> {
    const jogoDoc = doc(this.firestore, `jogos/${id}`);
    return docData(jogoDoc, { idField: 'id' }) as Observable<Jogo>;
  }

  adicionar(jogo: Omit<Jogo, 'id'>) {
    return addDoc(this.jogosRef, jogo);
  }

  editar(id: string, dados: Partial<Jogo>) {
    const jogoDoc = doc(this.firestore, `jogos/${id}`);
    return updateDoc(jogoDoc, dados);
  }

  remover(id: string) {
    const jogoDoc = doc(this.firestore, `jogos/${id}`);
    return deleteDoc(jogoDoc);
  }

  listarPorCriador(creatorId: string): Observable<Jogo[]> {
    const q = query(this.jogosRef, where('creatorId', '==', creatorId));
    return collectionData(q, { idField: 'id' }) as Observable<Jogo[]>;
  }

  getJogosInscritos(userId: string): Observable<Jogo[]> {
    const q = query(this.jogosRef, where('participantesIds', 'array-contains', userId));
    return collectionData(q, { idField: 'id' }) as Observable<Jogo[]>;
  }
}