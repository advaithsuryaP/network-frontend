import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Company } from './company.model';
import { HttpClient } from '@angular/common/http';

const API_URL = 'http://localhost:3000/api/v1';

@Injectable({
    providedIn: 'root'
})
export class CompaniesService {
    private _http = inject(HttpClient);

    private _companiesSubject: BehaviorSubject<Company[]> = new BehaviorSubject([]);
    companies$: Observable<Company[]> = this._companiesSubject.asObservable();

    fetchCompanies(): Observable<Company[]> {
        return this._http
            .get<Company[]>(`${API_URL}/companies`)
            .pipe(tap(companies => this._companiesSubject.next(companies)));
    }

    deleteCompany(id: string): Observable<{ message: string }> {
        return this._http
            .delete<{ message: string }>(`${API_URL}/companies/${id}`)
            .pipe(
                tap(_ => this._companiesSubject.next(this._companiesSubject.value.filter(company => company.id !== id)))
            );
    }
}
