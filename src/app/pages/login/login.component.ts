import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'] // Vamos adicionar o link para o nosso novo CSS
})
export class LoginComponent {
  // Agrupamos as credenciais num objeto, como é comum em formulários
  credentials = {
    email: '',
    password: ''
  };
  error = '';

  constructor(private auth: AuthService, private router: Router) { }

  async login() {
    try {
      // Usamos as propriedades do nosso novo objeto 'credentials'
      await this.auth.login(this.credentials.email, this.credentials.password);
      this.error = ''; // Limpa o erro em caso de sucesso
    } catch (err) {
      this.error = 'Usuário ou senha inválidos';
    }
  }

  async ngOnInit() {
    const autenticado = await this.auth.isAuthenticated();
    if (autenticado) {
      this.router.navigate(['/jogos']);
    }
  }
}