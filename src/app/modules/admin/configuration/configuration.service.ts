import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Configuration } from './configuration.model';
import { ConfigurationCategoryType } from './configuration.enum';

const API_URL = 'http://localhost:3000/api/v1';

@Injectable({
    providedIn: 'root'
})
export class ConfigurationService {
    private _http = inject(HttpClient);

    private _configurationsSubject = new BehaviorSubject<Configuration[]>([]);
    public configurations$ = this._configurationsSubject.asObservable();

    fetchConfigurations(): Observable<Configuration[]> {
        return this._http
            .get<Configuration[]>(`${API_URL}/configurations`)
            .pipe(tap(configurations => this._configurationsSubject.next(configurations)));
    }

    /**
     * Create configuration
     */
    createConfiguration(category: ConfigurationCategoryType): Observable<Configuration> {
        return this._http.post<Configuration>(`${API_URL}/configurations`, { category }).pipe(
            tap(newConfiguration => {
                this._configurationsSubject.next([...this._configurationsSubject.value, newConfiguration]);
            })
        );
    }

    updateConfiguration(configuration: Configuration): Observable<Configuration> {
        return this._http.put<Configuration>(`${API_URL}/configurations/${configuration.id}`, configuration).pipe(
            tap(updatedConfiguration => {
                const configurations = this._configurationsSubject.value;
                const index = configurations.findIndex(c => c.id === updatedConfiguration.id);
                if (index !== -1) {
                    configurations[index] = updatedConfiguration;
                    this._configurationsSubject.next([...configurations]);
                }
            })
        );
    }

    // Configuration should not be deleted, only disabled or hidden
    // deleteConfiguration(id: string): Observable<void> {
    //     return this._http
    //         .delete<void>(`${API_URL}/configurations/${id}`)
    //         .pipe(
    //             tap(() =>
    //                 this._configurationsSubject.next(
    //                     this._configurationsSubject.value.filter(configuration => configuration.id !== id)
    //                 )
    //             )
    //         );
    // }
}
