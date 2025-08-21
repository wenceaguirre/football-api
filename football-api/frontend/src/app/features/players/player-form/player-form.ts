import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ChangeDetectorRef } from '@angular/core';
import { PlayerService } from '../../../core/services/player.service';
import { CreatePlayerDto, Player, UpdatePlayerDto } from '../../../core/models/player.model';
import { environment } from '../../../environments/environment';

function emptyToUndef(v: string | null | undefined): string | undefined {
  if (v === null || v === undefined) return undefined;
  const s = String(v).trim();
  return s === '' ? undefined : s;
}

function numOrUndef(v: number | null | undefined): number | undefined {
  if (v === null || v === undefined) return undefined;
  const n = Number(v);
  return Number.isNaN(n) ? undefined : n;
}

@Component({
  standalone: true,
  selector: 'app-player-form',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './player-form.html',
  styleUrls: ['./player-form.scss'],
})
export class PlayerForm {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private api = inject(PlayerService);
  private cdr = inject(ChangeDetectorRef);

  id = signal<number | null>(null);
  mode = signal<'create' | 'edit'>('create');

  // ✅ nonNullable: evita undefined en strings requeridos
  form = this.fb.nonNullable.group({
    longName: ['', Validators.required],
    playerPositions: ['', Validators.required],
    clubName: [''],
    nationalityName: [''],
    playerFaceUrl: [''],
    fifaVersion: ['FIFA 25', Validators.required],
    fifaUpdate: [new Date().toISOString().slice(0, 10), Validators.required],
    rating: [null as number | null],
    speed: [null as number | null],
    shooting: [null as number | null],
    passing: [null as number | null],
    dribbling: [null as number | null],
  });

  defaultFace =
    'data:image/svg+xml;utf8,' +
    encodeURIComponent(
      `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 160 160'>
        <rect width='100%' height='100%' fill='#eaffea'/>
        <text x='80' y='18' font-size='14' text-anchor='middle' fill='#1c401c'>No face</text>
        <circle cx='80' cy='60' r='26' fill='#cfe9cf'/>
        <rect x='35' y='100' width='90' height='34' rx='8' fill='#cfe9cf'/>
      </svg>`
    );

  ngOnInit() {
    const idParam = this.route.snapshot.paramMap.get('id');
    const id = idParam ? Number(idParam) : null;
    console.log('Edit ID param:', idParam);

    if (id) {
      this.mode.set('edit');
      this.id.set(id);

      // ✅ Traemos y seteamos fuera del ciclo actual de CD para evitar NG0100
      this.api.get(id).subscribe((p: Player) => {
        queueMicrotask(() => {
          this.form.patchValue({
            longName: p.longName ?? '',
            playerPositions: p.playerPositions ?? '',
            clubName: p.clubName ?? '',
            nationalityName: p.nationalityName ?? '',
            playerFaceUrl: (p.playerFaceUrl ?? '').toString(),
            fifaVersion: p.fifaVersion ?? 'FIFA 25',
            fifaUpdate: p.fifaUpdate ?? new Date().toISOString().slice(0, 10),
            rating: p.rating ?? null,
            speed: p.speed ?? null,
            shooting: p.shooting ?? null,
            passing: p.passing ?? null,
            dribbling: p.dribbling ?? null,
          });
          this.form.markAsPristine();
          this.cdr.detectChanges();
        });
      });
    } else {
      this.mode.set('create');
    }
  }

  getImgSrc(url?: string): string {
    const src = (url ?? '').trim();
    if (!src) return this.defaultFace;
    if (src.startsWith('data:') || src.startsWith('blob:')) return src;
    if (/^https?:\/\//i.test(src)) return src;
    const slash = src.startsWith('/') ? '' : '/';
    return `${environment.apiUrl}${slash}${src}`;
  }

submit() {
  if (this.form.invalid) return;

  const v = this.form.getRawValue();

  // Mapeo a CreatePlayerDto (lo que espera el backend)
  const payload: CreatePlayerDto | UpdatePlayerDto = {
    name: v.longName,
    position: v.playerPositions,
    club: emptyToUndef(v.clubName),
    nationality: emptyToUndef(v.nationalityName),
    playerFaceUrl: emptyToUndef(v.playerFaceUrl),
    fifaVersion: emptyToUndef(v.fifaVersion),
    fifaUpdate: emptyToUndef(v.fifaUpdate),
    rating: numOrUndef(v.rating),
    speed: numOrUndef(v.speed),
    shooting: numOrUndef(v.shooting),
    passing: numOrUndef(v.passing),
    dribbling: numOrUndef(v.dribbling),
  };

  if (this.mode() === 'create') {
    this.api.create(payload as CreatePlayerDto).subscribe({
      next: (player) => 
        this.router.navigate(['/players']),
      error: (err) => {
        console.error('Create error', err, payload);
        alert('No se pudo crear el jugador. Revisá los campos obligatorios.');
      }
    });
  } else if (this.id()) {
    this.api.update(this.id()!, payload).subscribe({
      next: () => this.router.navigate(['/players']),
      error: (err) => {
        console.error('Update error', err, payload);
        alert('No se pudo actualizar el jugador.');
      }
    });
  }
}

  back() {
    this.router.navigate(['/players']);
  }

  onImgError(ev: Event) {
    const img = ev.target as HTMLImageElement | null;
    if (!img) return;
    if (img.src === this.defaultFace) {
      img.onerror = null;
      return;
    }
    img.src = this.defaultFace;
    img.onerror = null;
  }
}
