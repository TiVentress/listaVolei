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
  styleUrls: ['./login.component.css'] 
})
export class LoginComponent {
  credentials = {
    email: '',
    password: ''
  };
  error = '';

  constructor(private auth: AuthService, private router: Router) { }

  async login() {
    try {
      await this.auth.login(this.credentials.email, this.credentials.password);
      this.error = ''; 
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