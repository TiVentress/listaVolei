import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';


@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
})
export class LoginComponent {
  username = '';
  password = '';
  error = '';

  constructor(private auth: AuthService, private router: Router) {}

  async login() {
  try {
    await this.auth.login(this.username, this.password);
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

