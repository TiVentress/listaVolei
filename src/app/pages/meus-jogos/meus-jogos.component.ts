import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common'; // 1. IMPORTAR DatePipe
import { RouterModule } from '@angular/router';
import { Jogo } from '../../models/jogo.model';
import { JogoService } from '../../services/jogo.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-meus-jogos',
  standalone: true,
  imports: [CommonModule, RouterModule, DatePipe], // 2. ADICIONAR DatePipe AQUI
  templateUrl: './meus-jogos.component.html',
  styleUrl: './meus-jogos.component.css'
})
export class MeusJogosComponent implements OnInit {
  jogosCriados: Jogo[] = [];
  jogosInscritos: Jogo[] = [];
  isLoadingCriados = true;
  isLoadingInscritos = true;

  constructor(
    private jogoService: JogoService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.carregarJogos();
  }

  async carregarJogos() {
    this.isLoadingCriados = true;
    this.isLoadingInscritos = true;
    const user = await this.authService.getCurrentUser();
    if (user) {
      // Carrega os jogos criados pelo usuário
      this.jogoService.listarPorCriador(user.uid).subscribe(jogos => {
        this.jogosCriados = jogos;
        this.isLoadingCriados = false;
      });

      // Carrega os jogos em que o usuário está inscrito
      this.jogoService.getJogosInscritos(user.uid).subscribe(jogos => {
        this.jogosInscritos = jogos;
        this.isLoadingInscritos = false;
      });
    } else {
      this.isLoadingCriados = false;
      this.isLoadingInscritos = false;
    }
  }
}

