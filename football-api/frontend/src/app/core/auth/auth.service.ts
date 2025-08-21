import { HttpClient } from '@angular/common/http';
import { inject, Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';
import { isPlatformBrowser } from '@angular/common';
import { tap } from 'rxjs/operators';
import { Observable } from 'rxjs';

interface LoginDto { email: string; password: string;}
interface LoginResponse { access_token: string;}
export interface RegisterDto {
  name: string;
  email: string;
  password: string;
}

export interface AuthUser {
  id: number | string;
  name: string;
  email: string;
}

export interface AuthResponse {
  user: AuthUser;
  token?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private http = inject(HttpClient);
  private router = inject(Router);
  private tokenKey = 'token';
  private base = `${environment.apiUrl}/auth`;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  private get isBrowser() {
    return isPlatformBrowser(this.platformId);
  }

  login(dto: LoginDto){
    return this.http.post<LoginResponse>(`${environment.apiUrl}/auth/login`, dto);
  }

  saveToken(token: string) { 
    if (!this.isBrowser) return;
    try { localStorage.setItem(this.tokenKey, token);} catch {}
  }
  getToken(): string | null { 
    if(!this.isBrowser) return null;
    try {return localStorage.getItem(this.tokenKey);} catch{ return null; }
  }

  isLoggedIn(): boolean { return !!this.getToken(); }

  logout() {
    try {
      localStorage.removeItem(this.tokenKey);
      localStorage.removeItem('access_token'); // por si quedó de versiones anteriores
      sessionStorage.removeItem(this.tokenKey);
    } catch {}
      this.router.navigateByUrl('/login');
  }

  register(dto: RegisterDto): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.base}/register`, dto).pipe(
      tap(res => {
        if (res?.token) {
          localStorage.setItem('token', res.token);
        }
        if (res?.user) {
          localStorage.setItem('user', JSON.stringify(res.user));
        }
      })
    );
  }
}
