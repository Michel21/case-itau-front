import { Injectable, signal, computed } from '@angular/core';
import { ICatsTypes } from '../../types/cats-types';

export interface AppState {
  cats: ICatsTypes[];
  selectedCat: ICatsTypes | null;
  loading: boolean;
  searchTerm: string;
}

@Injectable({
  providedIn: 'root'
})
export class AppStateService {
  // Private signals for state management
  private readonly _cats = signal<ICatsTypes[]>([]);
  private readonly _selectedCat = signal<ICatsTypes | null>(null);
  private readonly _loading = signal<boolean>(false);
  private readonly _searchTerm = signal<string>('');

  // Public readonly signals
  public readonly cats = this._cats.asReadonly();
  public readonly selectedCat = this._selectedCat.asReadonly();
  public readonly loading = this._loading.asReadonly();
  public readonly searchTerm = this._searchTerm.asReadonly();

  // Computed signals
  public readonly filteredCats = computed(() => {
    const cats = this._cats();
    const searchTerm = this._searchTerm();
    
    if (!searchTerm) return cats;
    
    return cats.filter(cat => 
      cat.origin.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cat.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  public readonly hasCats = computed(() => this._cats().length > 0);
  public readonly hasSelectedCat = computed(() => this._selectedCat() !== null);

  // State update methods
  setCats(cats: ICatsTypes[]): void {
    this._cats.set(cats);
  }

  addCat(cat: ICatsTypes): void {
    this._cats.update(cats => [...cats, cat]);
  }

  updateCat(updatedCat: ICatsTypes): void {
    this._cats.update(cats => 
      cats.map(cat => cat.id === updatedCat.id ? updatedCat : cat)
    );
  }

  removeCat(catId: string): void {
    this._cats.update(cats => cats.filter(cat => cat.id !== catId));
  }

  setSelectedCat(cat: ICatsTypes | null): void {
    this._selectedCat.set(cat);
  }

  setLoading(loading: boolean): void {
    this._loading.set(loading);
  }

  setSearchTerm(term: string): void {
    this._searchTerm.set(term);
  }

  clearSearch(): void {
    this._searchTerm.set('');
  }

  // Utility methods
  getCatById(id: string): ICatsTypes | undefined {
    return this._cats().find(cat => cat.id === id);
  }

  resetState(): void {
    this._cats.set([]);
    this._selectedCat.set(null);
    this._loading.set(false);
    this._searchTerm.set('');
  }
}
