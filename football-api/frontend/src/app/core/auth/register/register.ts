import { Component, inject, signal } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { AuthService } from '../auth.service';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

function mustMatch(passwordKey: string, confirmKey: string) {
  return (group: AbstractControl): ValidationErrors | null => {
    const pwd = group.get(passwordKey)?.value;
    const cfm = group.get(confirmKey)?.value;
    if (pwd && cfm && pwd !== cfm) {
      group.get(confirmKey)?.setErrors({ mustMatch: true });
      return { mustMatch: true };
    }
    return null;
  };
}

@Component({
  selector: 'app-register',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.scss'
})
export class Register {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);

  loading = signal(false);
  error = signal<string | null>(null);
  success = signal(false);

  form = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    passwords: this.fb.group({
      password: ['', [
        Validators.required,
        Validators.minLength(8),
        // al menos 1 mayúscula, 1 minúscula, 1 número
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/),
      ]],
      confirm: ['']
    }, { validators: mustMatch('password', 'confirm') }),
    terms: [false, [Validators.required, Validators.requiredTrue]],
  });

  touched(path: string): boolean {
    const ctrl = this.get(path);
    return !!ctrl && (ctrl.touched || ctrl.dirty);
  }

  hasErr(path: string, err: string): boolean {
    const ctrl = this.get(path);
    if (!ctrl) return false;
    if (path.includes('.')) {
      // para el formGroup passwords y su error mustMatch
      return ctrl.hasError(err);
    }
    return ctrl.hasError(err);
  }

  private get(path: string) {
    return this.form.get(path);
  }

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { name, email, passwords, terms } = this.form.value;
    const dto = {
      name: name!,
      email: email!,
      password: passwords?.['password']!,
    };

    this.loading.set(true);
    this.error.set(null);

    this.auth.register(dto).subscribe({
      next: () => {
        this.success.set(true);
        this.loading.set(false);
        
        setTimeout(() => {
          this.router.navigateByUrl('/login'); 
        }, 800);
      },
      error: (err) => {
        this.loading.set(false);
        
        const status = err?.status;
        if (status === 409) this.error.set('Ese email ya está registrado.');
        else if (status === 400) this.error.set(err?.error?.message ?? 'Datos inválidos.');
        else this.error.set('No se pudo completar el registro. Intenta nuevamente.');
      }
    });
  }
}
