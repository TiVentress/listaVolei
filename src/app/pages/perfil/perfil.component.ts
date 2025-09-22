import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { UserService, AppUser } from '../../services/user.service';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './perfil.component.html',
  styleUrl: './perfil.component.css'
})
export class PerfilComponent implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private userService = inject(UserService);
  private cdr = inject(ChangeDetectorRef); 

  perfilForm!: FormGroup;
  currentUserUid: string | null = null;

  ngOnInit(): void {
    this.perfilForm = this.fb.group({
      nome: ['', Validators.required],
      email: [{ value: '', disabled: true }],
      celular: ['', Validators.required]
    });
    this.loadUserProfile();
  }

  async loadUserProfile() {
    const user = await this.authService.getCurrentUser();
    if (user && user.uid) {
      this.currentUserUid = user.uid;
      const docSnap = await this.userService.getUserProfile(this.currentUserUid);
      if (docSnap.exists()) {
        const userData = docSnap.data() as AppUser;

        this.perfilForm.setValue({
          nome: userData.nome || '',
          email: userData.email || '',
          celular: userData.celular || ''
        });

        this.cdr.detectChanges(); 
        
      } else {
        console.error("ERRO: Documento do usuário não foi encontrado na coleção 'users' com o UID:", this.currentUserUid);
      }
    } else {
      console.error("ERRO: Não foi possível obter o usuário logado do AuthService.");
    }
  }

  async onSubmit() {
    if (this.perfilForm.invalid || !this.currentUserUid) return;

    const formData = {
      nome: this.perfilForm.get('nome')?.value,
      celular: this.perfilForm.get('celular')?.value
    };

    try {
      await this.userService.updateUserProfile(this.currentUserUid!, formData);
      alert('Perfil atualizado com sucesso!');
    } catch (error) {
      console.error("ERRO ao atualizar o perfil:", error);
      alert('Ocorreu um erro ao atualizar o perfil. Verifique o console.');
    }
  }
}