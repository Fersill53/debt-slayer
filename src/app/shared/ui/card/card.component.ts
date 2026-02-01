import { Component, Input } from '@angular/core';

type Tone = 'default' | 'muted';

@Component({
  selector: 'app-card',
  standalone: true,
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss'],
})
export class CardComponent {
  @Input() tone: Tone = 'default';
}
