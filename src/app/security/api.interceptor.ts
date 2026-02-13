import { HttpEvent, HttpHandlerFn, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';
import { inject } from '@angular/core';
import { urlConfig } from '../../config/url.config';
import { AuthStoreService } from '../core/auth/auth-store.service';

/**
 * Interceptor HTTP profissional que adiciona:
 * - Bearer token JWT no header Authorization (para API de investimentos)
 * - x-api-key (para outras APIs)
 * 
 * Estratégia: Usa AuthStoreService (Single Source of Truth)
 * - Valida expiração do token antes de enviar
 * - Sincronizado automaticamente entre MFEs
 * - Suporta cross-tab e cross-origin
 * 
 * O token contém agência e conta, que são extraídas automaticamente pela API.
 */
export function ApiInterceptor(req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> {
  const authStore = inject(AuthStoreService);
  const token = authStore.getToken();
  
  const headers: { [key: string]: string } = {};
  
  // Adicionar x-api-key se configurado
  if (urlConfig.x_api_key) {
    headers['x-api-key'] = urlConfig.x_api_key;
  }
  
  // Adicionar Bearer token se disponível e válido
  if (token && authStore.isValidToken()) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const apiRequest = req.clone({ 
    setHeaders: headers
  });
  
  return next(apiRequest);
}