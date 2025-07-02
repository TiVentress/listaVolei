import { Injectable } from '@angular/core';
import { Auth, signInWithEmailAndPassword, signOut, onAuthStateChanged } from '@angular/fire/auth';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class AuthService {
  constructor(private auth: Auth, private router: Router) {}

  async login(email: string, password: string): Promise<void> {
  try {
    await signInWithEmailAndPassword(this.auth, email, password);
    this.router.navigate(['/jogos']);
  } catch (error) {
    throw new Error('Login inválido');
  }
}

  async logout(): Promise<void> {
  await signOut(this.auth);
  this.router.navigate(['/login']);
}


  isAuthenticated(): Promise<boolean> {
    return new Promise(resolve => {
      onAuthStateChanged(this.auth, user => resolve(!!user));
    });
  }
}
