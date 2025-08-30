import { HttpEvent, HttpHandlerFn, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';
import { urlConfig } from '../../config/url.config';

export function ApiInterceptor(req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> {
  const apiRequest = req.clone({ 
    setHeaders: { 'x-api-key': `${urlConfig.x_api_key}` } 
  });
  return next(apiRequest);
}