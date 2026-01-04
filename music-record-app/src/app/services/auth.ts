import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../enviroments/enviroment';

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'clerk' | 'manager' | 'admin';
}

export interface LoginResponse {
  id: number;
  name: string;
  email: string;
  role: 'clerk' | 'manager' | 'admin';
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private apiUrl = environment.apiUrl;
  
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  currentUser$ = this.currentUserSubject.asObservable();

  constructor() {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      this.currentUserSubject.next(JSON.parse(savedUser));
    }
  }

  login(email: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, { email, password })
      .pipe(
        tap(response => {
          localStorage.setItem('currentUser', JSON.stringify(response));
          this.currentUserSubject.next(response);
        })
      );
  }

  logout(): void {
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  isLoggedIn(): boolean {
    return !!this.getCurrentUser();
  }

  getUserRole(): string | null {
    const user = this.getCurrentUser();
    return user ? user.role : null;
  }

  canAdd(): boolean {
    const role = this.getUserRole();
    return role === 'clerk' || role === 'manager' || role === 'admin';
  }

  canUpdate(): boolean {
    const role = this.getUserRole();
    return role === 'manager' || role === 'admin';
  }

  canDelete(): boolean {
    const role = this.getUserRole();
    return role === 'admin';
  }

  getAssignmentRole(): string {
    const role = this.getUserRole();
    switch(role) {
      case 'clerk': return 'Salesperson';
      case 'manager': return 'Store Manager';
      case 'admin': return 'System Admin';
      default: return 'Unknown';
    }
  }
}