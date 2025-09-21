import { Injectable } from '@angular/core';
import { Auth, signInWithEmailAndPassword, signOut, createUserWithEmailAndPassword, updateProfile } from '@angular/fire/auth';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class FirebaseAuthService {

  constructor(public auth: Auth, private router: Router) { }

  login(email: string, password: string) {
    return signInWithEmailAndPassword(this.auth, email, password);
  }

  async register(nome: string, email: string, password: string) {
    const userCredential = await createUserWithEmailAndPassword(this.auth, email, password);

    await updateProfile(userCredential.user, { displayName: nome });

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