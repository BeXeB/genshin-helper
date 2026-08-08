import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { combineLatest, map, Observable, shareReplay } from 'rxjs';
import { Hyperlink } from '../_models/hyperlinks';

@Injectable({
  providedIn: 'root',
})
export class HyperlinkService {
  private gameHyperlinksPath = 'assets/json/hyperlinks.json';
  private customHyperlinksPath = 'assets/json/custom-hyperlinks.json';

  private hyperlinks$?: Observable<Map<string | number, Hyperlink>>;

  constructor(private http: HttpClient) {}

  /**
   * Returns a Map of all hyperlinks (game + custom)
   * Keyed by: numeric ID for game hyperlinks, string ID for custom hyperlinks
   */
  getHyperlinksMap(): Observable<Map<string | number, Hyperlink>> {
    if (!this.hyperlinks$) {
      this.hyperlinks$ = combineLatest([
        this.http.get<Hyperlink[]>(this.gameHyperlinksPath),
        this.http.get<Hyperlink[]>(this.customHyperlinksPath),
      ]).pipe(
        map(([gameLinks, customLinks]) => {
          const map = new Map<string | number, Hyperlink>();

          // Add game hyperlinks (numeric IDs)
          gameLinks.forEach(link => {
            map.set(link.id, link);
          });

          // Add custom hyperlinks (string IDs)
          customLinks.forEach(link => {
            map.set(link.id, link);
          });

          return map;
        }),
        shareReplay(1),
      );
    }

    return this.hyperlinks$;
  }

  getHyperlink(id: string | number): Observable<Hyperlink | undefined> {
    return this.getHyperlinksMap().pipe(
      map((hyperlinks) => hyperlinks.get(id)),
    );
  }
}

