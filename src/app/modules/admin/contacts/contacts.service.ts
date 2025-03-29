import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Contact } from './contacts.model';
import { BehaviorSubject, map, Observable, switchMap, tap, take } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class ContactsService {
    private _http = inject(HttpClient);

    private _contactSubject: BehaviorSubject<Contact | null> =
        new BehaviorSubject(null);

    private _contactsSubject: BehaviorSubject<Contact[] | null> =
        new BehaviorSubject([
            {
                id: '1',
                firstName: 'John',
                lastName: 'Doe',
                email: 'john.doe@example.com',
                phone: '+1 (555) 123-4567',
                position: 'Software Engineer',
                notes: 'Key technical contact',
                roleInCompany: 'Developer',
                companyId: '',
            },
            {
                id: '2',
                firstName: 'Jane',
                lastName: 'Smith',
                email: 'jane.smith@example.com',
                phone: '+1 (555) 987-6543',
                position: 'UX Designer',
                notes: 'Project lead for redesign',
                roleInCompany: 'Developer',
                companyId: '',
            },
            {
                id: '3',
                firstName: 'Mike',
                lastName: 'Johnson',
                email: 'mike.j@example.com',
                phone: '+1 (555) 246-8135',
                position: 'Project Manager',
                notes: 'Primary client contact',
                roleInCompany: 'Developer',
                companyId: '',
            },
        ]);

    /**
     * Search contacts with given query
     *
     * @param query
     */
    // searchContacts(query: string): Observable<Contact[]> {
    //     return this.http
    //         .get<Contact[]>('api/apps/contacts/search', {
    //             params: { query },
    //         })
    //         .pipe(
    //             tap((contacts) => {
    //                 this._contacts.next(contacts);
    //             })
    //         );
    // }

    contact$: Observable<Contact> = this._contactSubject.asObservable();
    contacts$: Observable<Contact[]> = this._contactsSubject.asObservable();

    getContacts(): Observable<Contact[]> {
        return this._http
            .get<Contact[]>('/api/v1/contacts')
            .pipe(tap((contacts) => this._contactsSubject.next(contacts)));
    }

    getContact(id: string) {
        return this._http.get(`/api/contacts/${id}`);
    }

    createContact(): Observable<Contact> {
        return this.contacts$.pipe(
            take(1),
            switchMap((contacts) =>
                this._http.post<Contact>('api/v1/contacts', {}).pipe(
                    map((newContact) => {
                        // Update the contacts with the new contact
                        this._contactsSubject.next([newContact, ...contacts]);

                        // Return the new contact
                        return newContact;
                    })
                )
            )
        );
    }

    updateContact(id: string, contact: any) {
        return this._http.put(`/api/contacts/${id}`, contact);
    }
    deleteContact(id: string) {
        return this._http.delete(`/api/contacts/${id}`);
    }
    getCompanies() {
        return this._http.get('/api/companies');
    }
    getCompany(id: string) {
        return this._http.get(`/api/companies/${id}`);
    }
    createCompany(company: any) {
        return this._http.post('/api/companies', company);
    }
    updateCompany(id: string, company: any) {
        return this._http.put(`/api/companies/${id}`, company);
    }
    deleteCompany(id: string) {
        return this._http.delete(`/api/companies/${id}`);
    }
}
