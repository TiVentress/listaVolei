import { Injectable } from '@angular/core';
import { Firestore, doc, getDoc, setDoc, updateDoc } from '@angular/fire/firestore';
import { BehaviorSubject, Subject } from 'rxjs'; 

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
  private userNameSubject = new BehaviorSubject<string | null>(null);
  public userName$ = this.userNameSubject.asObservable();

  private userProfileCreated = new Subject<void>();
  public userProfileCreated$ = this.userProfileCreated.asObservable();

  constructor(private firestore: Firestore) { }

  notifyProfileCreated() {
    this.userProfileCreated.next();
  }

  async getUserProfile(uid: string) {
    const userRef = doc(this.firestore, `users/${uid}`);
    const docSnap = await getDoc(userRef);
    if (docSnap.exists()) {
      this.userNameSubject.next(docSnap.data()['nome']);
    }
    return docSnap;
  }

  async updateUserProfile(uid: string, data: Partial<AppUser>) {
    const userRef = doc(this.firestore, `users/${uid}`);
    await updateDoc(userRef, data);
    if (data.nome) {
      this.userNameSubject.next(data.nome);
    }
  }

  saveUser(user: AppUser) {
    const userRef = doc(this.firestore, `users/${user.uid}`);
    return setDoc(userRef, user, { merge: true });
  }
}