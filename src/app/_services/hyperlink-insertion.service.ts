import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class HyperlinkInsertionService {
  private insertionSubject = new Subject<{
    id: string | number;
    displayText?: string;
    type?: 'C' | 'Z'; // Link type indicator
  }>();

  public insertion$ = this.insertionSubject.asObservable();

  currentCharacterName: string | null = null;

  insertHyperlink(id: string | number, displayText?: string, type?: 'C' | 'Z'): void {
    this.insertionSubject.next({ id, displayText, type });
  }

  setCurrentCharacter(characterName: string | null): void {
    this.currentCharacterName = characterName;
  }
}
