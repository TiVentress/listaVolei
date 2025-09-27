import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router'; 
import { Jogo } from '../../models/jogo.model';
import { JogoService } from '../../services/jogo.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-meus-jogos',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './meus-jogos.component.html',
})
export class MeusJogosComponent implements OnInit {
  jogosCriados: Jogo[] = [];
  isLoading = true;

  constructor(
    private jogoService: JogoService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.carregarJogosCriados();
  }

  async carregarJogosCriados() {
    this.isLoading = true;
    const user = await this.authService.getCurrentUser();
    if (user) {
      this.jogoService.listarPorCriador(user.uid).subscribe(jogos => {
        this.jogosCriados = jogos;
        this.isLoading = false;
      });
    } else {
      this.isLoading = false;
    }
  }
}