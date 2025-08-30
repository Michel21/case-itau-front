import { Injectable, signal } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly currentUserSignal = signal<User | null>(null);
  private readonly isAuthenticatedSubject = new BehaviorSubject<boolean>(false);

  public readonly currentUser = this.currentUserSignal.asReadonly();
  public readonly isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor() {
    // Check if user is logged in from localStorage
    this.checkStoredAuth();
  }

  private checkStoredAuth(): void {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        this.setCurrentUser(user);
      } catch (error) {
        this.logout();
      }
    }
  }

  login(email: string, password: string): Observable<boolean> {
    // Simulate API call
    return new Observable(observer => {
      setTimeout(() => {
        if (email === 'admin@example.com' && password === 'admin123') {
          const user: User = {
            id: '1',
            name: 'Admin User',
            email: email,
            role: 'admin'
          };
          this.setCurrentUser(user);
          observer.next(true);
        } else if (email === 'user@example.com' && password === 'user123') {
          const user: User = {
            id: '2',
            name: 'Regular User',
            email: email,
            role: 'user'
          };
          this.setCurrentUser(user);
          observer.next(true);
        } else {
          observer.next(false);
        }
        observer.complete();
      }, 1000);
    });
  }

  logout(): void {
    this.currentUserSignal.set(null);
    this.isAuthenticatedSubject.next(false);
    localStorage.removeItem('currentUser');
  }

  private setCurrentUser(user: User): void {
    this.currentUserSignal.set(user);
    this.isAuthenticatedSubject.next(true);
    localStorage.setItem('currentUser', JSON.stringify(user));
  }

  hasRole(role: string): boolean {
    const user = this.currentUser();
    return user?.role === role;
  }

  isAdmin(): boolean {
    return this.hasRole('admin');
  }
}
