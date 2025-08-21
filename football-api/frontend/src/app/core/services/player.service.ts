import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Player, Paged, CreatePlayerDto, UpdatePlayerDto } from '../models/player.model';
import { map } from 'rxjs/operators';

const pick = <T = any>(obj: any, keys: string[], fallback?: T): T =>
  (keys.find((k) => obj?.[k] != null) ? obj[keys.find((k) => obj?.[k] != null)!] : fallback) as T;

const num = (v: any) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
};

function resolveUrl(u: string | null | undefined): string {
  const raw = (u ?? '').toString().trim();
  if (!raw) return '';

  if (raw.startsWith('data:image/')) return raw;

  if (/^https?:\/\//i.test(raw)) return raw;

  if (/^[A-Za-z0-9+/=]+$/.test(raw) && raw.length > 100) {
    return `data:image/jpeg;base64,${raw}`;
  }

  const slash = raw.startsWith('/') ? '' : '/';
  return `${environment.apiUrl}${slash}${raw}`;
}

function normalizePlayer(raw: any): Player {
  return {
    id: pick(raw, ['id', 'ID']),
    fifaVersion: pick(raw, ['fifaVersion', 'fifa_version'], 'FIFA 25'),
    fifaUpdate: pick(raw, ['fifaUpdate', 'fifa_update'], new Date().toISOString().slice(0, 10)),
    playerFaceUrl: resolveUrl(
      raw?.playerFaceUrl ?? raw?.player_face_url ?? raw?.faceUrl ?? raw?.photoUrl ?? raw?.photo_url
    ),
    longName: pick(raw, ['longName', 'long_name', 'playerName', 'player_name', 'name'], ''),
    playerPositions: pick(raw, ['playerPositions', 'player_positions', 'position', 'pos'], ''),
    clubName: pick(raw, ['clubName', 'club_name', 'club'], ''),
    nationalityName: pick(
      raw,
      ['nationalityName', 'nationality_name', 'nationality', 'country'],
      ''
    ),
    // Stats: cubrimos variantes comunes (FIFA/SOFIFA abreviadas)
    rating: num(pick(raw, ['rating', 'overall', 'overall_rating', 'ovr'])),
    speed: num(pick(raw, ['speed', 'pace', 'pac'])),
    shooting: num(pick(raw, ['shooting', 'sho'])),
    passing: num(pick(raw, ['passing', 'pas'])),
    dribbling: num(pick(raw, ['dribbling', 'dri'])),
  } as Player;
}

@Injectable({ providedIn: 'root' })
export class PlayerService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/players`;

  private numOrU(v: unknown): number | undefined {
    const n = Number(v);
    return Number.isFinite(n) ? n : undefined;
  }

  list(page = 1, limit = 12, search: string | null | undefined = '') {
    
    const searchStr = (search ?? '').toString();

    let params = new HttpParams().set('page', String(page)).set('limit', String(limit));
    if (searchStr) {
      
      params = params.set('search', searchStr).set('q', searchStr).set('name', searchStr);
    }

    return this.http.get<any>(this.base, { observe: 'response', params }).pipe(
      map((res) => {
      const body = res.body;

      
      const rawItems = Array.isArray(body) ? body : (body?.items ?? body?.data ?? body?.rows ?? []);
      const items = rawItems.map(normalizePlayer);

      
      const totalHeader = Number(res.headers.get('X-Total-Count') || res.headers.get('x-total-count'));
      const total = Number.isFinite(totalHeader) ? totalHeader : Number(body?.total) || items.length;

      
      const pageResp  = Number(body?.page)  || page;
      const limitResp = Number(body?.limit) || limit;

      
      const totalPages = Number(body?.totalPages) || Math.max(1, Math.ceil(total / limitResp));

      return { items, total, page: pageResp, limit: limitResp, totalPages } as Paged<Player>;
      })
    );
  }

  import(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<any>(`${this.base}/import`, formData, {
      reportProgress: false,
    });
  }

  export(format: 'csv' | 'xlsx' = 'csv') {
    const params = new HttpParams().set('format', format);
    // Pedir respuesta como blob para poder descargar el archivo
    return this.http.get(`${this.base}/export`, { params, responseType: 'blob' });
  }

  get(id: number) {
    return this.http.get<any>(`${this.base}/${id}`).pipe(map(normalizePlayer));
  }

  create(body: CreatePlayerDto) {
    return this.http.post<Player>(this.base, body);
  }

  update(id: number, body: UpdatePlayerDto) {
    return this.http.put<Player>(`${this.base}/${id}`, body);
  }

  delete(id: number) {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
