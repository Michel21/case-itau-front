import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { urlConfig } from '../../../../config/url.config';
import { ICatsTypes } from '../../../types/cats-types';


@Injectable({
  providedIn: 'root'
})

export class HomeService {

  constructor(private http: HttpClient) { }

  getCats(): Observable<ICatsTypes[]>{
    return this.http.get<ICatsTypes[]>(`${urlConfig.api_cat}`);
  }

}
