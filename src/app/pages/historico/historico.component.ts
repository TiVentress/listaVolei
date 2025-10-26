import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Jogo } from '../../models/jogo.model';
import { JogoService } from '../../services/jogo.service';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-historico',
  standalone: true,
  imports: [CommonModule, RouterModule, DatePipe],
  templateUrl: './historico.component.html',
  styleUrls: ['./historico.component.css']
})
export class HistoricoComponent implements OnInit {
  jogosPassados: Jogo[] = [];
  isLoading = true;

  constructor(private jogoService: JogoService) { }

  ngOnInit(): void {
    this.jogoService.getHistoricoJogos().subscribe(jogos => {
      this.jogosPassados = jogos;
      this.isLoading = false;
    });
  }
}