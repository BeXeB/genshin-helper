import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import {
  Character,
  CharacterBriefDescriptions,
  CharacterProfile,
} from '../_models/character';

@Injectable({
  providedIn: 'root',
})
export class CharacterService {
  private basePath = 'assets/json/characters/';
  private briefDescriptionPath = 'assets/json/briefdescription/';

  constructor(private http: HttpClient) {}

  getCharacters(): Observable<CharacterProfile[]> {
    return this.http.get<CharacterProfile[]>(`${this.basePath}profiles.json`);
  }

  getCharacterNames(): Observable<string[]> {
    return this.http.get<string[]>(`${this.basePath}index.json`);
  }

  getCharacterDetails(name: string): Observable<Character> {
    return this.http.get<Character>(`${this.basePath}${name}.json`);
  }

  getBriefDescriptions(
    name: string,
  ): Observable<Partial<CharacterBriefDescriptions>> {
    return this.http
      .get<Partial<CharacterBriefDescriptions>>(
        `${this.briefDescriptionPath}${name}.json`,
      )
      .pipe(catchError(() => of({})));
  }
}
