import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Company } from './company.model';
import { HttpClient, HttpParams } from '@angular/common/http';

const API_URL = 'http://localhost:3000/api/v1';

@Injectable({
    providedIn: 'root'
})
export class CompaniesService {
    private _http = inject(HttpClient);

    private _companiesSubject: BehaviorSubject<Company[]> = new BehaviorSubject([]);
    companies$: Observable<Company[]> = this._companiesSubject.asObservable();

    private _startupsSubject: BehaviorSubject<Company[]> = new BehaviorSubject([]);
    startups$: Observable<Company[]> = this._startupsSubject.asObservable();

    fetchCompanies(): Observable<Company[]> {
        return this._http
            .get<Company[]>(`${API_URL}/companies`)
            .pipe(tap(companies => this._companiesSubject.next(companies)));
    }

    fetchStartups(): Observable<Company[]> {
        const params = new HttpParams().set('category', 'startup');
        return this._http
            .get<Company[]>(`${API_URL}/companies`, { params })
            .pipe(tap(companies => this._startupsSubject.next(companies)));
    }
}
