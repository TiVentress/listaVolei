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
  query,    // 1. IMPORTAR 'query'
  where,    // 2. IMPORTAR 'where'
  orderBy   // 3. IMPORTAR 'orderBy'
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Jogo } from '../models/jogo.model';

@Injectable({ providedIn: 'root' })
export class JogoService {
  private jogosRef: CollectionReference;

  constructor(private firestore: Firestore) {
    this.jogosRef = collection(this.firestore, 'jogos');
  }

  /**
   * Lista apenas os jogos agendados para hoje ou datas futuras.
   * Os jogos são ordenados pela data, do mais próximo ao mais distante.
   */
  listar(): Observable<Jogo[]> {
    // 4. PREPARA A DATA DE HOJE PARA A CONSULTA
    // Pega a data atual e formata para 'YYYY-MM-DD' para comparar com o banco
    const hoje = new Date();
    // Zera a hora, minuto, segundo para garantir que a comparação pegue o dia inteiro
    hoje.setHours(0, 0, 0, 0); 
    const hojeString = hoje.toISOString().split('T')[0];

    // 5. CRIA A CONSULTA (QUERY) FILTRADA E ORDENADA
    const q = query(
      this.jogosRef,
      where('data', '>=', hojeString), // Filtro: data do jogo deve ser maior ou igual a hoje
      orderBy('data', 'asc')             // Ordenação: da data mais próxima para a mais distante
    );

    // 6. EXECUTA A CONSULTA FILTRADA
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