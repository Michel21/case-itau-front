import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

import { _PATH } from '../../shared/constants/constants';
import { ListDetailService } from './services/list-detail.service';

@Component({
  selector: 'app-list-detail',
  templateUrl: './list-detail.component.html',
  styleUrls: ['./list-detail.component.scss'],
  standalone: true,
  imports: [CommonModule]
})
export class ListDetailComponent implements OnInit {
  public listDetails: unknown;
  public loader: boolean = false;
  public listScheleton = [1, 2, 3, 4, 5, 6, 7];
  public path = `${_PATH}/load.gif`;
  public state: unknown;

  constructor(
    private listDetailSrv: ListDetailService,
    private routeActivate: ActivatedRoute,
    private router: Router,
  ) {
    const navigation = this.router.getCurrentNavigation();
    this.state = navigation.extras.state;
  }

  ngOnInit(): void {
    this.listDetailSrv.getCatsId(this.routeActivate.snapshot.params['id'])
      .subscribe((res) => {
        this.listDetails = res;
      })
  }

}
