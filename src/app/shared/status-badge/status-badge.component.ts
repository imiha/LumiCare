import { Component, input } from '@angular/core';

@Component({
  selector: 'app-status-badge',
  standalone: true,
  template: `<span class="badge" [class]="'badge--' + status()">{{ status() }}</span>`,
  styles: [`
    .badge {
      display: inline-block;
      padding: 3px 10px;
      border-radius: 20px;
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .badge--scheduled { background: color-mix(in srgb, #4a9eff 15%, transparent); color: #4a9eff; }
    .badge--confirmed { background: color-mix(in srgb, #4caf50 15%, transparent); color: #4caf50; }
    .badge--completed { background: color-mix(in srgb, #8892a4 20%, transparent); color: #8892a4; }
    .badge--cancelled { background: color-mix(in srgb, #e05252 15%, transparent); color: #e05252; }
  `],
})
export class StatusBadgeComponent {
  status = input.required<string>();
}
