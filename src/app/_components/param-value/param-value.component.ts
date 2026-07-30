import { Component, Input, OnInit } from '@angular/core';
import { CharacterService } from '../../_services/character.service';

@Component({
  selector: 'app-param-value',
  imports: [],
  template: `{{ displayValue }}`,
})
export class ParamValueComponent implements OnInit {
  @Input({ required: true }) groupId!: number;
  @Input({ required: true }) level!: number;
  @Input({ required: true }) paramIndex!: number;
  @Input({ required: true }) multiplier!: number;

  displayValue = '?';

  constructor(private characterService: CharacterService) {}

  ngOnInit(): void {
    this.characterService
      .getSkillByGroupId(this.groupId)
      .subscribe((skill) => {
        const raw = skill?.attributes.parameters[`param${this.paramIndex}`]?.[
          this.level - 1
        ];

        if (raw === undefined) {
          console.error(
            `Unable to resolve PARAM tag: groupId=${this.groupId}, paramIndex=${this.paramIndex}, level=${this.level}`,
          );
          return;
        }

        this.displayValue = this.formatValue(raw * this.multiplier);
      });
  }

  private formatValue(value: number): string {
    return value.toFixed(1).replace(/\.0$/, '');
  }
}
