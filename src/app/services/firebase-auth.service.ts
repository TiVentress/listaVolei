// Em: src/app/services/firebase-auth.service.ts

// 1. IMPORTAR 'updateProfile' da biblioteca @angular/fire/auth
import { Injectable } from '@angular/core';
import { Auth, signInWithEmailAndPassword, signOut, createUserWithEmailAndPassword, updateProfile } from '@angular/fire/auth';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class FirebaseAuthService {

  constructor(public auth: Auth, private router: Router) {}

  login(email: string, password: string) {
    return signInWithEmailAndPassword(this.auth, email, password);
  }

  // 2. MODIFICAR o método register para ser assíncrono e aceitar o nome
  async register(nome: string, email: string, password: string) {
    // Primeiro, cria o usuário com email e senha
    const userCredential = await createUserWithEmailAndPassword(this.auth, email, password);

    // Depois, atualiza o perfil do usuário recém-criado com o nome (displayName)
    await updateProfile(userCredential.user, { displayName: nome });

    // Retorna as credenciais do usuário para o componente
    return userCredential;
  }

  logout() {
    return signOut(this.auth).then(() => {
      this.router.navigate(['/login']);
    });
  }

  isLoggedIn(): boolean {
    return !!this.auth.currentUser;
  }
}