import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { urlConfig } from 'src/config/url.config';

interface ICatsTypes {
  id: string;
  url: string;
  width: string;
  height: string;
  mime_type: string;
  entities: [];
  breeds: [
    {
      id: 3;
      name: string;
      wikipedia_url: string;
    },
    {
      id: 2;
      name: string;
      wikipedia_url: string;
    }
  ];
  animals: [];
  categories: [];
}

@Injectable({
  providedIn: 'root'
})

export class HomeService {

  constructor(private http: HttpClient) { }

  getCats(): Observable<ICatsTypes[]>{
    return this.http.get<ICatsTypes[]>(`${urlConfig.api_cat}`);
  }

}
