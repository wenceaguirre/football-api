import { Component, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { PlayerService } from '../../../core/services/player.service';
import { Paged, Player } from '../../../core/models/player.model';
import { Paginator } from '../../../shared/paginator/paginator/paginator';
import { LoadingSpinner } from '../../../shared/ui/loading-spinner/loading-spinner';
import { environment } from '../../../environments/environment';

@Component({
  standalone: true,
  selector: 'app-player-list',
  imports: [CommonModule, RouterLink, Paginator, LoadingSpinner],
  templateUrl: './player-list.html',
  styleUrls: ['./player-list.scss'],
})
export class PlayerList {
  private api = inject(PlayerService);

  loading = signal(true);
  page = signal(1);
  limit = signal(12);
  total = signal(0);
  search = signal<string>('');

  private allItems = signal<Player[]>([]);
  items = signal<Player[]>([]);
  paged = signal<Paged<Player>>({ items: [], total: 0, page: 1, limit: 10 });

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

  constructor() {
    effect(() => {
      this.fetch();
    });
  }

  onSearch(term: string) {
    this.search.set((term ?? '').toString());
    this.page.set(1);
    this.fetch();
  }

  onPageChange(p: number) {
    this.page.set(p);
    this.fetch();
  }

  private applyFilter() {
    const term = (this.search() ?? '').toString().trim().toLowerCase();
    const base = this.allItems();
    const filtered = !term
      ? base
      : base.filter((p) =>
          [p.longName, p.clubName, p.nationalityName, p.playerPositions].some((v) =>
            (v ?? '').toLowerCase().includes(term)
          )
        );
    this.total.set(filtered.length);
    const start = (this.page() - 1) * this.limit();
    this.items.set(filtered.slice(start, start + this.limit()));
  }

  fetch() {
    this.loading.set(true);
    this.api.list(this.page(), this.limit(), this.search()).subscribe({
      next: (res) => {
        this.items.set(res.items);
        this.total.set(res.total || res.items.length);
        this.loading.set(false);
        console.debug('Ejemplo Player normalizado:', res.items[0]);
      },
      error: () => {
        this.items.set([]);
        this.total.set(0);
        this.loading.set(false);
      },
    });
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

  getImgSrc(url?: string): string {
    if (!url) return this.defaultFace;
    const clean = url.trim();
    if (clean.startsWith('http')) return clean;
    return `${environment.apiUrl}/uploads/${clean}`;
  }

  importPlayers(file: File) {
    if (!file) return;
    this.loading.set(true);
    this.api.import(file).subscribe({
      next: (res) => {
        this.loading.set(false);
        // Mostrar resumen de importación
        const { inserted, updated, errorsCount } = res;
        alert(
          `Importación completa.\nNuevos: ${inserted}, Actualizados: ${updated}, Errores: ${errorsCount}`
        );
        this.page.set(1);
        this.fetch(); // recargar lista desde el inicio para incluir nuevos datos
      },
      error: (err) => {
        this.loading.set(false);
        console.error('Error al importar jugadores', err);
        alert('Error al importar el archivo. Verifique el formato CSV.');
      },
    });
  }

  exportPlayers() {
    this.api.export('csv').subscribe({
      next: (blob) => {
        // Crear URL temporal y disparar descarga
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'players.csv'; // nombre de archivo deseado
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      },
      error: (err) => {
        console.error('Error al exportar jugadores', err);
        alert('No se pudo exportar el archivo.');
      },
    });
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input?.files?.length) {
      const file = input.files[0];
      this.importPlayers(file);
      // opcional: resetear el valor del input para poder volver a seleccionar el mismo archivo si se desea
      input.value = '';
    }
  }

  remove(id?: number) {
    if (!id) return;
    if (!confirm('¿Eliminar jugador?')) return;
    this.api.delete(id).subscribe({ next: () => this.fetch() });
  }
}
