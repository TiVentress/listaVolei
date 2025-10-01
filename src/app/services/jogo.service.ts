// Arquivo: src/app/services/jogo.service.ts

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
import { Observable, map } from 'rxjs'; // Adicione a importação do 'map'
import { Jogo } from '../models/jogo.model';

@Injectable({ providedIn: 'root' })
export class JogoService {
  private jogosRef: CollectionReference;

  constructor(private firestore: Firestore) {
    this.jogosRef = collection(this.firestore, 'jogos');
  }

  // NOVO MÉTODO: Busca todos os jogos, sem filtro de data.
  // Será a nossa "fonte da verdade".
  listarTodos(): Observable<Jogo[]> {
    const q = query(this.jogosRef, orderBy('data', 'desc'));
    return collectionData(q, { idField: 'id' }) as Observable<Jogo[]>;
  }

  // MÉTODO 'listar' ATUALIZADO: agora ele usa o 'listarTodos' e filtra os jogos futuros.
  listar(): Observable<Jogo[]> {
    const hojeString = new Date().toISOString().split('T')[0];
    return this.listarTodos().pipe(
      map(jogos => jogos.filter(jogo => jogo.data >= hojeString).sort((a, b) => a.data.localeCompare(b.data))) // Ordena do mais próximo para o mais distante
    );
  }

  // MÉTODO 'getHistoricoJogos' ATUALIZADO: agora ele também filtra a partir de 'listarTodos'.
  getHistoricoJogos(): Observable<Jogo[]> {
    const hojeString = new Date().toISOString().split('T')[0];
    return this.listarTodos().pipe(
      map(jogos => jogos.filter(jogo => jogo.data < hojeString)) // A ordenação 'desc' do listarTodos já funciona aqui
    );
  }

  // O resto dos seus métodos permanece exatamente igual
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