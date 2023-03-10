import { Component, Inject } from "@angular/core";

import { Router } from "@angular/router";

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})

export class HeaderComponent {
  constructor(private route: Router){}

  onNavigateTo(){
    this.route.navigate(['/home'])
  }
}