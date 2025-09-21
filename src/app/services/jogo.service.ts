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
  orderBy
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Jogo } from '../models/jogo.model';

@Injectable({ providedIn: 'root' })
export class JogoService {
  private jogosRef: CollectionReference;

  constructor(private firestore: Firestore) {
    this.jogosRef = collection(this.firestore, 'jogos');
  }

  listar(): Observable<Jogo[]> {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const hojeString = hoje.toISOString().split('T')[0];

    const q = query(
      this.jogosRef,
      where('data', '>=', hojeString),
      orderBy('data', 'asc')
    );

    return collectionData(q, { idField: 'id' }) as Observable<Jogo[]>;
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
}