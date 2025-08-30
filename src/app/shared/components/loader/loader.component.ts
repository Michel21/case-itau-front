import { Component, Input, OnInit } from '@angular/core';

@Component({
    selector: 'app-loading',
    templateUrl: './loader.component.html',
    styleUrls: ['./loader.component.scss'],
    standalone: false
})
export class LoaderComponent implements OnInit {

  @Input() height: string;
  
  constructor() { }

  ngOnInit() {
  }

}
