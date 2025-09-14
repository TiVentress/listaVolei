import { Component } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { FirebaseAuthService } from '../../services/firebase-auth.service'; // Verifique o caminho se necessário

// Imports necessários para componente standalone
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-register',
  standalone: true, // Assumindo projeto standalone moderno
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './register.component.html',
})
export class RegisterComponent {
  error: string | null = null;
  isLoading: boolean = false; // Para feedback visual (opcional)

  constructor(private authService: FirebaseAuthService, private router: Router) {}

  onSubmit(form: NgForm) {
    if (form.invalid) {
      return;
    }

    this.isLoading = true;
    this.error = null;

    const { email, password, confirmPassword } = form.value;

    // 1. Validar se as senhas coincidem
    if (password !== confirmPassword) {
      this.error = 'As senhas não coincidem.';
      this.isLoading = false;
      return;
    }

    // 2. Chamar o serviço de registro
    this.authService.register(email, password)
      .then(() => {
        // Sucesso, redireciona para a lista de jogos logado
        this.router.navigate(['/jogos']);
      })
      .catch(err => {
        // Tratamento de erros comuns do Firebase
        if (err.code === 'auth/email-already-in-use') {
          this.error = 'Este email já está cadastrado.';
        } else if (err.code === 'auth/weak-password') {
          this.error = 'A senha deve ter no mínimo 6 caracteres.';
        } else {
          this.error = 'Ocorreu um erro ao tentar registrar. Tente novamente.';
          console.error(err);
        }
        this.isLoading = false;
      });
  }
}