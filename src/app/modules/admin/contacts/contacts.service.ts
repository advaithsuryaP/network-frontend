import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Contact, Country } from './contacts.model';
import {
    BehaviorSubject,
    map,
    Observable,
    switchMap,
    tap,
    take,
    throwError,
    of,
} from 'rxjs';

const API_URL = 'http://localhost:3000/api/v1';

@Injectable({
    providedIn: 'root',
})
export class ContactsService {
    private _http = inject(HttpClient);

    private _contactSubject: BehaviorSubject<Contact | null> =
        new BehaviorSubject(null);

    private _contactsSubject: BehaviorSubject<Contact[]> = new BehaviorSubject([
        {
            id: '1',
            firstName: 'Anurag',
            lastName: 'Mandal',
            background: 'assets/images/background/umbc-4.jpg',
            emails: [
                {
                    label: 'Personal',
                    email: 'anurag.mandal@gmail.com',
                },
                {
                    label: 'Work',
                    email: 'anurag.mandal@example.com',
                },
            ],
            phoneNumbers: [
                {
                    label: 'Personal',
                    countryCode: 'in',
                    phoneNumber: '(555) 123-4567',
                },
            ],
            notes: '<p>Key technical contact</p>',
            title: 'Chief Executive Officer',
            companyId: 'x123',
            company: {
                id: 'x123',
                name: 'Xai',
                description:
                    'UMBC Training Centers is a leading provider of professional development and training services.',
                website: 'https://www.umbctraining.com',
                category: 'Education',
                primaryIndustry: 'Education',
                secondaryIndustry: 'Training',
                attractedOutOfState: false,
                confidentialityRequested: false,
                intellectualProperty: 'None',
                departmentIfFaculty: 'N/A',
                pointOfContactName: 'Henrick Klassen',
            },
            major: '2004, PhD',
        },
        {
            id: '2',
            firstName: 'Damien',
            lastName: 'Smith',
            background: 'assets/images/background/umbc-3.jpg',
            emails: [
                {
                    label: 'Work',
                    email: 'damien.smith@example.com',
                },
            ],
            phoneNumbers: [
                {
                    label: 'Personal',
                    countryCode: 'us',
                    phoneNumber: '(555) 123-4567',
                },
            ],
            notes: '<p>Key technical contact</p>',
            title: 'Lead Software Engineer',
            companyId: 'x345',
            company: {
                id: 'x345',
                name: 'Under Armour',
                description:
                    'UMBC Training Centers is a leading provider of professional development and training services.',
                website: 'https://www.umbctraining.com',
                category: 'enterprise',
                primaryIndustry: 'Fashion',
                secondaryIndustry: '',
                attractedOutOfState: false,
                confidentialityRequested: false,
                intellectualProperty: 'None',
                departmentIfFaculty: 'N/A',
                pointOfContactName: 'Steve Smith',
            },
            major: '2012, MS',
        },
        {
            id: '3',
            firstName: 'Micheal Martyn',
            lastName: 'Doe',
            background: 'assets/images/background/umbc-1.jpg',
            emails: [
                {
                    label: 'Work',
                    email: 'micheal.martyn@example.com',
                },
            ],
            phoneNumbers: [
                {
                    label: 'Personal',
                    countryCode: 'tr',
                    phoneNumber: '(555) 123-4567',
                },
            ],
            notes: '<p>Key technical contact</p>',
            title: 'Marketing Manager',
            companyId: 'x256',
            company: {
                id: 'x345',
                name: 'BB & T',
                description:
                    'UMBC Training Centers is a leading provider of professional development and training services.',
                website: 'https://www.umbctraining.com',
                category: 'startup',
                primaryIndustry: 'Food',
                secondaryIndustry: '',
                attractedOutOfState: false,
                confidentialityRequested: false,
                intellectualProperty: 'None',
                departmentIfFaculty: 'N/A',
                pointOfContactName: 'Andrew Symonds',
            },
        },
    ]);

    private _countriesSubject: BehaviorSubject<Country[]> = new BehaviorSubject(
        []
    );

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
    countries$: Observable<Country[]> = this._countriesSubject.asObservable();

    getContacts(): Observable<Contact[]> {
        return this._http
            .get<Contact[]>('/api/v1/contacts')
            .pipe(tap((contacts) => this._contactsSubject.next(contacts)));
    }

    getContactById(id: string) {
        return this._contactsSubject.pipe(
            take(1),
            map((contacts) => {
                // Find the contact
                const contact = contacts.find((item) => item.id === id) || null;

                // Update the contact
                this._contactSubject.next(contact);

                // Return the contact
                return contact;
            }),
            switchMap((contact) => {
                if (!contact) {
                    return throwError(
                        () => new Error('No contact found with id ' + id)
                    );
                }

                return of(contact);
            })
        );
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

    /**
     * Get countries
     */
    fetchCountries(): Observable<Country[]> {
        return this._http
            .get<Country[]>(`${API_URL}/metadata/countries`)
            .pipe(tap((countries) => this._countriesSubject.next(countries)));
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
