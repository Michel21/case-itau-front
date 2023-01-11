import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from "@angular/common/http";
import { Observable } from "rxjs";
import { urlConfig } from "src/config/url.config";

export class ApiInterceptor implements HttpInterceptor{
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
      const apiRequest = req.clone({ 
        setHeaders: { 'x-api-key': `${urlConfig.x_api_key}`} 
      })
    return next.handle(apiRequest);
  }
}