import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './header.html',
  styleUrls: ['./header.css']
})
export class HeaderComponent {
  private authService = inject(AuthService);
  private router = inject(Router);
  
  currentUser$ = this.authService.currentUser$;

  canAddRecords(): boolean {
    return this.authService.canAdd();
  }

  canUpdateRecords(): boolean {
    return this.authService.canUpdate();
  }

  canDeleteRecords(): boolean {
    return this.authService.canDelete();
  }

  getUserRoleDisplay(): string {
    return this.authService.getAssignmentRole();
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}