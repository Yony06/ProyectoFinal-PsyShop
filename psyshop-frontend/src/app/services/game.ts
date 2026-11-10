
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Game {
  id: number;
  title: string;
  slug: string;
  description: string | null;
  price: string | number;
  stock: number;
  platform: string;
  genre: string | null;
  image_url: string | null;
  is_active: boolean;
}

export interface GameResponse {
  current_page: number;
  data: Game[];
  last_page: number;
  total: number;
}

@Injectable({
  providedIn: 'root'
})
export class GameService {
  private http = inject(HttpClient);

  private apiUrl = 'http://127.0.0.1:8000/api/games';

  getGames(): Observable<GameResponse> {
    return this.http.get<GameResponse>(this.apiUrl);
  }

  getGameById(id: number): Observable<Game> {
    return this.http.get<Game>(`${this.apiUrl}/${id}`);
  }
}
