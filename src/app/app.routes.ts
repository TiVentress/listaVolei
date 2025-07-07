import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { JogosComponent } from './pages/jogos/jogos.component';
import { JogoFormComponent } from './pages/jogo-form/jogo-form.component';
import { ParticipantesComponent } from './pages/participantes/participantes.component';
import { ParticipanteFormComponent } from './pages/participante-form/participante-form.component';
import { NotFoundComponent } from './pages/not-found/not-found.component';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'jogos', component: JogosComponent, canActivate: [authGuard] },
  { path: 'jogos/novo', component: JogoFormComponent, canActivate: [authGuard] },
  { path: 'jogos/editar/:id', component: JogoFormComponent, canActivate: [authGuard] },
  { path: 'jogos/:id/participantes', loadComponent: () => import('./pages/participantes/participantes.component').then(m => m.ParticipantesComponent), canActivate: [authGuard] },

  { path: 'participantes/novo', component: ParticipanteFormComponent, canActivate: [authGuard] },
  { path: 'participantes/editar/:id', component: ParticipanteFormComponent, canActivate: [authGuard] },

  { path: '**', component: NotFoundComponent }
];

