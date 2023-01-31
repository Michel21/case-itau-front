import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-loading-placeholder',
  templateUrl: './loading-placeholder.component.html',
  styleUrls: ['./loading-placeholder.component.scss']
})
export class LoadingPlaceholderComponent {

  @Input() height: string;
  @Input() width: string;
  @Input() border: boolean = false;

}
