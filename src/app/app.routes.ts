import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { JogosComponent } from './pages/jogos/jogos.component';
import { JogoFormComponent } from './pages/jogo-form/jogo-form.component';
import { ParticipantesComponent } from './pages/participantes/participantes.component';
import { ParticipanteFormComponent } from './pages/participante-form/participante-form.component';
import { NotFoundComponent } from './pages/not-found/not-found.component';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { 
    path: '', 
    loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent) 
  },
  
  { path: 'login', component: LoginComponent },
  { path: 'jogos', component: JogosComponent, canActivate: [authGuard] },
  { path: 'jogos/novo', component: JogoFormComponent, canActivate: [authGuard] },
  { path: 'jogos/editar/:id', component: JogoFormComponent, canActivate: [authGuard] },
  { path: 'jogos/:id/participantes', loadComponent: () => import('./pages/participantes/participantes.component').then(m => m.ParticipantesComponent), canActivate: [authGuard] },
  { path: 'register', loadComponent: () => import('./pages/register/register.component').then(m => m.RegisterComponent) },
  { 
    path: 'quem-somos', 
    loadComponent: () => import('./pages/quem-somos/quem-somos.component').then(m => m.QuemSomosComponent)
  },
  {
    path: 'perfil',
    loadComponent: () => import('./pages/perfil/perfil.component').then(m => m.PerfilComponent),
    canActivate: [authGuard]
  },
  {
    path: 'meus-jogos',
    loadComponent: () => import('./pages/meus-jogos/meus-jogos.component').then(m => m.MeusJogosComponent),
    canActivate: [authGuard]
  },
  {
    path: 'historico',
    loadComponent: () => import('./pages/historico/historico.component').then(m => m.HistoricoComponent),
    canActivate: [authGuard]
  },
  { path: 'participantes/novo', component: ParticipanteFormComponent, canActivate: [authGuard] },
  { path: 'participantes/editar/:id', component: ParticipanteFormComponent, canActivate: [authGuard] },
  { path: '**', component: NotFoundComponent }
];