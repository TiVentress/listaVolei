import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ParticipanteService } from '../../services/participante.service';
import { Participante } from '../../models/participante.model';

@Component({
  selector: 'app-participantes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './participantes.component.html',
})
export class ParticipantesComponent {
  jogoId!: string;
  nome = '';
  filtroNome = '';
  participantes: Participante[] = [];

  constructor(
    private participanteService: ParticipanteService,
    private route: ActivatedRoute
  ) {
    // Isto continua correto, pegando o ID do jogo da rota.
    this.jogoId = this.route.snapshot.paramMap.get('id')!;
    this.carregar();
  }

  carregar() {
    // Esta chamada já estava correta para o novo serviço.
    this.participanteService
      .listarPorJogo(this.jogoId)
      .subscribe(ps => (this.participantes = ps));
  }

  get participantesFiltrados() {
    return this.participantes.filter(p =>
      p.nome.toLowerCase().includes(this.filtroNome.toLowerCase())
    );
  }

  adicionar() {
    if (this.nome.trim()) {
      // CORREÇÃO:
      // 1. A chamada ao serviço agora passa o jogoId primeiro.
      // 2. O objeto a ser adicionado já não precisa do jogoId.
      // 3. Usamos 'presencaConfirmada' em vez de 'confirmado'.
      this.participanteService.adicionar(this.jogoId, {
        nome: this.nome,
        presencaConfirmada: false,
      });
      this.nome = '';
    }
  }

  alternarConfirmacao(p: Participante) {
    // CORREÇÃO:
    // 1. Passamos o jogoId como primeiro argumento para os métodos do serviço.
    // 2. Verificamos a propriedade 'presencaConfirmada'.
    p.presencaConfirmada
      ? this.participanteService.desconfirmar(this.jogoId, p.id!)
      : this.participanteService.confirmar(this.jogoId, p.id!);
  }

  remover(id: string) {
    // CORREÇÃO: Passamos o jogoId como primeiro argumento.
    this.participanteService.remover(this.jogoId, id);
  }
}
