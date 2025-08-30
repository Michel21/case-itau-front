import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, NavigationExtras } from '@angular/router';
import { debounceTime, distinctUntilChanged, switchMap, catchError, filter, map } from 'rxjs/operators';
import { from, fromEvent } from 'rxjs';

import { HomeService } from './services/home.service';
import { _PATH } from '../../shared/constants/constants';
import { ICatsTypes } from '../../types/cats-types';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})

export class HomeComponent implements OnInit, AfterViewInit {
  public objectListaResponse: ICatsTypes[] = [];
  public listScheleton = [1,2,3,4,5,6,7,8,9];
  public navExtra: NavigationExtras = {
    state: {}
  };
  
  @ViewChild('input', { static: true }) input!: ElementRef;
  public loadding: boolean = false;
  public path = `${_PATH}/circle-loading-animation.gif`;

  constructor(
    private homeSrv: HomeService,
    private route: Router
    ) { }

  ngOnInit(): void {
    this.homeSrv.getCats().subscribe({
      next: (res) => {
        this.objectListaResponse = res;
      }
    })
  }
 

  ngAfterViewInit() {
    fromEvent(this.input.nativeElement, 'keyup')
      .pipe(
        filter(Boolean),
        debounceTime(500),
        switchMap(() => this.homeSrv.getCats()
        .pipe(catchError(() => from<any[]>([])))),
        map((items: ICatsTypes[]) => {
          this.loadding = true;
          if (this.input.nativeElement.value) {
            items = items.filter((product) =>
            product.origin.toLowerCase().
            includes(this.input.nativeElement.value.toLowerCase()));
          }
          return items;
        }),
        distinctUntilChanged((prev, curr) => (prev.length === curr.length))
      )
      .subscribe((searchItems) => {
        this.objectListaResponse = searchItems;
        this.loadding = false;
      });
  }

  onNavigateTo(item: ICatsTypes): void {
    this.route.navigate([`home/list-detalhe/${item.id}`], { state: item });
  }
  
  doSomethingOnError(event: any) {
    event.target.src = this.path;
  }
}
