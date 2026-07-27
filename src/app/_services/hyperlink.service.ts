import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable, shareReplay } from 'rxjs';
import { Hyperlink } from '../_models/hyperlinks';

@Injectable({
  providedIn: 'root',
})
export class HyperlinkService {
  private basePath = 'assets/json/hyperlinks.json';

  private hyperlinks$?: Observable<Hyperlink[]>;

  constructor(private http: HttpClient) {}

  getHyperlinks(): Observable<Hyperlink[]> {
    if (!this.hyperlinks$) {
      this.hyperlinks$ = this.http
        .get<Hyperlink[]>(this.basePath)
        .pipe(
          shareReplay(1),
        );
    }

    return this.hyperlinks$;
  }

  getHyperlink(id: number): Observable<Hyperlink | undefined> {
    return this.getHyperlinks().pipe(
      map((hyperlinks) =>
        hyperlinks.find((hyperlink) => hyperlink.id === id),
      ),
    );
  }
}
