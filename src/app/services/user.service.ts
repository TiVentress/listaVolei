import { Injectable } from '@angular/core';
import { Firestore, doc, setDoc } from '@angular/fire/firestore';

export interface AppUser {
  uid: string;
  nome: string;
  email: string;
  celular: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  constructor(private firestore: Firestore) { }

  // Salva ou atualiza os dados de um usuário na coleção 'users'
  saveUser(user: AppUser) {
    const userRef = doc(this.firestore, `users/${user.uid}`);
    return setDoc(userRef, user, { merge: true }); // 'merge: true' evita sobrescrever dados existentes
  }
}