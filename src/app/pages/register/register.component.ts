// Em: src/app/pages/register/register.component.ts

import { Component } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { FirebaseAuthService } from '../../services/firebase-auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './register.component.html',
})
export class RegisterComponent {
  error: string | null = null;
  isLoading: boolean = false;

  constructor(private authService: FirebaseAuthService, private router: Router) {}

  onSubmit(form: NgForm) {
    if (form.invalid) {
      return;
    }

    this.isLoading = true;
    this.error = null;

    // 1. OBTER o novo campo 'name' do formulário
    const { name, email, password, confirmPassword } = form.value;

    if (password !== confirmPassword) {
      this.error = 'As senhas não coincidem.';
      this.isLoading = false;
      return;
    }

    // 2. PASSAR o nome para o serviço de registro
    this.authService.register(name, email, password)
      .then(() => {
        this.isLoading = false;
        this.router.navigate(['/jogos']);
      })
      .catch(err => {
        this.isLoading = false;
        if (err.code === 'auth/email-already-in-use') {
          this.error = 'Este email já está cadastrado.';
        } else if (err.code === 'auth/weak-password') {
          this.error = 'A senha deve ter no mínimo 6 caracteres.';
        } else {
          this.error = 'Ocorreu um erro ao tentar registrar. Tente novamente.';
          console.error(err);
        }
      });
  }
}