import { Component, Input } from '@angular/core';

type Variant = 'primary' | 'ghost' | 'link';

@Component({
  selector: 'app-button',
  standalone: true,
  templateUrl: './button.component.html',
  styleUrls: ['./button.component.scss'],
})
export class ButtonComponent {
  @Input() variant: Variant = 'ghost';
  @Input() disabled = false;
  @Input() type: 'button' | 'submit' = 'button';
}
