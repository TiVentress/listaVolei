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
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Jogo } from '../models/jogo.model';

@Injectable({ providedIn: 'root' })
export class JogoService {
  private jogosRef!: CollectionReference;   // declarado, mas só recebe valor no construtor

  constructor(private firestore: Firestore) {
    // Agora o Firestore já foi injetado, podemos criar a referência com segurança
    this.jogosRef = collection(this.firestore, 'jogos');
  }

  listar(): Observable<Jogo[]> {
    return collectionData(this.jogosRef, { idField: 'id' }) as Observable<Jogo[]>;
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


