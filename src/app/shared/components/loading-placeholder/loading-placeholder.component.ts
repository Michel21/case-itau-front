import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-loading-placeholder',
  templateUrl: './loading-placeholder.component.html',
  styleUrls: ['./loading-placeholder.component.scss'],
  standalone: true
})
export class LoadingPlaceholderComponent {
  @Input() height!: string;
  @Input() width!: string;
  @Input() border: boolean = false;
}
