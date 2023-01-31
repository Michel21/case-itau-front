import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { LazyLoadDirective } from '../../../app/shared/components/image-lazy-load/lazy-load.directive';
import { LoadingPlaceholderComponent } from '../../../app/shared/components/loading-placeholder/loading-placeholder.component';

import { ListDetailComponent } from './list-detail.component';
import { ListDetailService } from './services/list-detail.service';

describe('ListDetailComponent', () => {
  let component: ListDetailComponent;
  let fixture: ComponentFixture<ListDetailComponent>;


  
  const activeRouteMock = {
    snapshot: {
      params: {
        id: 'abys'
      }
    }
  }

  let routerMock = {
    navigate: jest.fn(),
    getCurrentNavigation: () => ({extras: {state: ''}}),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ListDetailComponent, LoadingPlaceholderComponent, LazyLoadDirective ],
      imports: [
         RouterTestingModule.withRoutes([]),
         HttpClientTestingModule
      ],
      providers: [
        ListDetailService,
        { provide: Router, useFactory: () => routerMock },
        { provide: ActivatedRoute, useFactory: () => activeRouteMock },
      ],
      schemas:[CUSTOM_ELEMENTS_SCHEMA]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ListDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
