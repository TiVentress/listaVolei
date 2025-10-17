import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Unsubscribe, User } from '@angular/fire/auth';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';
import { Subscription } from 'rxjs';

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
  private profileCreatedSubscription!: Subscription;

  ngOnInit(): void {
    this.authUnsubscribe = this.authService.onAuthStateChangedListener(async (user) => {
      this.isLoggedIn = !!user;
      if (user) {
        this.userService.getUserProfile(user.uid);
      }
    });

    this.profileCreatedSubscription = this.userService.userProfileCreated$.subscribe(async () => {
      const user = await this.authService.getCurrentUser();
      if (user) {
        this.userService.getUserProfile(user.uid);
      }
    });
  }

  ngOnDestroy(): void {
    if (this.authUnsubscribe) {
      this.authUnsubscribe();
    }
    if (this.profileCreatedSubscription) {
      this.profileCreatedSubscription.unsubscribe();
    }
  }

  logout() {
    this.authService.logout();
  }
}