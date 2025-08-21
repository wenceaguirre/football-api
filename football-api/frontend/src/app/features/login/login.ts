import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  standalone: true,
  selector: 'app-login',
  imports: [CommonModule, ReactiveFormsModule ],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class Login {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);

  loading = signal(false);
  error = signal<string | null>(null);

  form = this.fb.group({
    email: this.fb.nonNullable.control('', [Validators.required, Validators.email]),
    password: this.fb.nonNullable.control('', [Validators.required, Validators.minLength(6)]),
  });

  goRegister() {
    this.router.navigate(['register']);
  }
  submit() {
    this.error.set(null);
    if (this.form.invalid) return;
    this.loading.set(true);
    this.auth.login(this.form.getRawValue()).subscribe({
      next: (res) => {
        this.auth.saveToken(res.access_token);
        this.router.navigate(['/players']);
      },
      error: (err) => {
        this.error.set(err?.error?.message || 'Credenciales inválidas');
        this.loading.set(false);
      }
    });
  }
}
