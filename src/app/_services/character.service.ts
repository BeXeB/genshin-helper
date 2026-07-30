import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { forkJoin, Observable, of } from 'rxjs';
import { catchError, map, shareReplay, switchMap } from 'rxjs/operators';
import {
  Character,
  CharacterBriefDescriptions,
  CharacterConstellation,
  CharacterProfile,
  CharacterTalents,
  CombatTalent,
  ConstellationDetail,
  PassiveTalent,
} from '../_models/character';

interface CharacterTalentIndex {
  skills: Map<number, CombatTalent>;
  skillGroups: Map<number, CombatTalent>;
  passives: Map<number, PassiveTalent>;
  constellations: Map<number, ConstellationDetail>;
}

@Injectable({
  providedIn: 'root',
})
export class CharacterService {
  private basePath = 'assets/json/characters/';
  private briefDescriptionPath = 'assets/json/briefdescription/';

  private talentIndex$?: Observable<CharacterTalentIndex>;

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

  getSkill(id: number): Observable<CombatTalent | undefined> {
    return this.getTalentIndex().pipe(map((index) => index.skills.get(id)));
  }

  getSkillByGroupId(groupId: number): Observable<CombatTalent | undefined> {
    return this.getTalentIndex().pipe(
      map((index) => index.skillGroups.get(groupId)),
    );
  }

  getPassiveTalent(id: number): Observable<PassiveTalent | undefined> {
    return this.getTalentIndex().pipe(
      map((index) => index.passives.get(id)),
    );
  }

  getConstellation(id: number): Observable<ConstellationDetail | undefined> {
    return this.getTalentIndex().pipe(
      map((index) => index.constellations.get(id)),
    );
  }

  private getTalentIndex(): Observable<CharacterTalentIndex> {
    if (!this.talentIndex$) {
      this.talentIndex$ = this.getCharacters().pipe(
        switchMap((profiles) =>
          forkJoin(
            profiles.map((profile) =>
              this.getCharacterDetails(profile.normalizedName).pipe(
                catchError(() => of(undefined)),
              ),
            ),
          ),
        ),
        map((characters) => {
          const index: CharacterTalentIndex = {
            skills: new Map(),
            skillGroups: new Map(),
            passives: new Map(),
            constellations: new Map(),
          };

          for (const character of characters) {
            if (!character) {
              continue;
            }

            this.addTalents(index, character.skills);
            this.addConstellation(index, character.constellation);

            for (const variant of Object.values(character.variants ?? {})) {
              this.addTalents(index, variant?.skills);
              this.addConstellation(index, variant?.constellation);
            }
          }

          return index;
        }),
        shareReplay(1),
      );
    }

    return this.talentIndex$;
  }

  private addTalents(
    index: CharacterTalentIndex,
    talents?: CharacterTalents,
  ): void {
    if (!talents) {
      return;
    }

    for (const skill of [talents.combat1, talents.combat2, talents.combat3]) {
      if (skill) {
        index.skills.set(skill.id, skill);

        if (skill.proudSkillGroupId) {
          index.skillGroups.set(skill.proudSkillGroupId, skill);
        }
      }
    }

    for (const passive of [
      talents.passive1,
      talents.passive2,
      talents.passive3,
      talents.passive4,
    ]) {
      if (passive) {
        index.passives.set(passive.id, passive);
      }
    }
  }

  private addConstellation(
    index: CharacterTalentIndex,
    constellation?: CharacterConstellation,
  ): void {
    if (!constellation) {
      return;
    }

    for (const detail of [
      constellation.c1,
      constellation.c2,
      constellation.c3,
      constellation.c4,
      constellation.c5,
      constellation.c6,
    ]) {
      if (detail) {
        index.constellations.set(detail.id, detail);
      }
    }
  }
}
