import { Component, EventEmitter, Input, Output, computed, signal } from '@angular/core';
import { NgClass } from '@angular/common';

type Appearance = 'compact' | 'cozy';

@Component({
  selector: 'app-paginator',
  standalone: true,
  imports: [NgClass],
  templateUrl: './paginator.html',
  styleUrls: ['./paginator.scss'],
})
export class Paginator {
  /** Total de ítems */
  private _total = signal(0);
  /** Página actual (1-based) */
  private _page = signal(1);
  /** Tamaño de página */
  private _limit = signal(10);

  @Input({ required: true }) set total(v: number) { this._total.set(Math.max(0, v ?? 0)); }
  @Input({ required: true }) set page(v: number)  { this._page.set(Math.max(1, v ?? 1)); }
  @Input({ required: true }) set limit(v: number) { this._limit.set(Math.max(1, v ?? 10)); }

  @Input() siblingCount = 1;   // páginas vecinas
  @Input() boundaryCount = 1;  // bordes
  @Input() appearance: Appearance = 'cozy';
  @Input() tonal = true;

  @Output() pageChange = new EventEmitter<number>();

  totalPages = computed(() => {
    const total = this._total();
    const limit = this._limit();
    return Math.max(1, Math.ceil(total / Math.max(1, limit)));
  });

  isFirst = computed(() => this._page() <= 1);
  isLast  = computed(() => this._page() >= this.totalPages());

  // items visibles con elipsis
  visibleItems = computed<(number | '…')[]>(() => {
    const totalPages = this.totalPages();
    const current = Math.min(Math.max(1, this._page()), totalPages);
    const boundary = Math.max(0, this.boundaryCount);
    const sibling = Math.max(0, this.siblingCount);

    // si son pocas páginas, mostrar todas
    if (totalPages <= boundary * 2 + sibling * 2 + 3) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const pages: number[] = Array.from({ length: totalPages }, (_, i) => i + 1);
    const start = pages.slice(0, Math.min(boundary, totalPages));
    const end = pages.slice(Math.max(totalPages - boundary, 0));

    const left = Math.max(
      Math.min(current - sibling, totalPages - boundary - sibling * 2 - 1),
      boundary + 2
    );
    const right = Math.min(
      Math.max(current + sibling, boundary + sibling * 2 + 2),
      end.length ? end[0] - 2 : totalPages - 1
    );

    const mid: number[] = [];
    for (let i = left; i <= right; i++) if (i >= 1 && i <= totalPages) mid.push(i);

    const out: (number | '…')[] = [...start];
    if (mid.length) {
      if (start.length && mid[0] > start[start.length - 1] + 1) out.push('…');
      out.push(...mid);
      if (end.length && mid[mid.length - 1] < end[0] - 1) out.push('…');
    } else if (start.length && end.length && start[start.length - 1] < end[0] - 1) {
      out.push('…');
    }
    out.push(...end);
    return out;
  });

  goTo(p: number) {
    const target = Math.max(1, Math.min(p, this.totalPages()));
    if (target !== this._page()) this.pageChange.emit(target);
  }
  prev() { if (!this.isFirst()) this.goTo(this._page() - 1); }
  next() { if (!this.isLast())  this.goTo(this._page() + 1); }

  // helpers para template
  pg()  { return this._page(); }
}
