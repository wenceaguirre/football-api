import { Component, inject } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Title, Meta } from '@angular/platform-browser';
import { FormsModule, ɵInternalFormsSharedModule } from "@angular/forms";

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [CommonModule, RouterLink, ɵInternalFormsSharedModule, FormsModule],
  templateUrl: './not-found.html',
  styleUrls: ['./not-found.scss'],
})
export class NotFound {
  private title = inject(Title);
  private meta = inject(Meta);
  private location = inject(Location);

  q = '';

  constructor() {
    this.title.setTitle('404 • Página no encontrada');
    this.meta.updateTag({
      name: 'description',
      content:
        'La página que intentas ver no existe o fue movida. Volvé al inicio o usá la búsqueda.',
    });
  }

  goBack() {
    this.location.back();
  }

  search() {
    // Redirige a tu ruta de búsqueda si la tenés (ajustá el path según tu app)
    if (this.q?.trim()) {
      window.location.href = `/players?search=${encodeURIComponent(this.q.trim())}`;
    }
  }
}
