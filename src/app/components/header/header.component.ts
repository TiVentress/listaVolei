import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Unsubscribe } from '@angular/fire/auth';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent implements OnInit, OnDestroy {
  private authService = inject(AuthService);
  public userService = inject(UserService);

  isLoggedIn = false;
  private authUnsubscribe!: Unsubscribe;

  ngOnInit(): void {
    this.authUnsubscribe = this.authService.onAuthStateChangedListener(async (user) => {
      this.isLoggedIn = !!user; 
      if (user) {
        this.userService.getUserProfile(user.uid);
      }
    });
  }

  ngOnDestroy(): void {
    if (this.authUnsubscribe) {
      this.authUnsubscribe();
    }
  }

  logout() {
    this.authService.logout();
  }
}