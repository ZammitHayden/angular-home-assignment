import { Injectable } from '@angular/core';
import {
  CanActivate,
  Router,
  ActivatedRouteSnapshot
} from '@angular/router';
import { AuthService } from '../services/auth';


@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {

  constructor(
    private auth: AuthService,
    private router: Router
  ) {}

  canActivate(): boolean {
    if (this.auth.isLoggedIn()) {
      return true;
    }

    this.router.navigate(['/login']);
    return false;
  }
}


@Injectable({ providedIn: 'root' })
export class LoginGuard implements CanActivate {

  constructor(
    private auth: AuthService,
    private router: Router
  ) {}

  canActivate(): boolean {
    if (this.auth.isLoggedIn()) {
      this.router.navigate(['/records']);
      return false;
    }
    return true;
  }
}


@Injectable({ providedIn: 'root' })
export class RoleGuard implements CanActivate {

  constructor(
    private auth: AuthService,
    private router: Router
  ) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    const allowedRoles = route.data['roles'] as string[];

    const userRole = this.auth.getUserRole();

    if (userRole && allowedRoles.includes(userRole)) {
      return true;
    }

    this.router.navigate(['/records']);
    return false;
  }
}
