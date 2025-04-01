import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Category, Contact, Country } from './contacts.model';
import {
    BehaviorSubject,
    map,
    Observable,
    switchMap,
    tap,
    take,
    throwError,
    of,
    filter,
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
                category: 'startup',
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

    private _categoriesSubject: BehaviorSubject<Category[]> =
        new BehaviorSubject([]);

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
    categories$: Observable<Category[]> =
        this._categoriesSubject.asObservable();

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

    /**
     * Update contact
     *
     * @param id
     * @param contact
     */
    updateContact(id: string, contact: Contact): Observable<Contact> {
        return this.contacts$.pipe(
            take(1),
            switchMap((contacts) =>
                this._http
                    .patch<Contact>('api/apps/contacts/contact', {
                        id,
                        contact,
                    })
                    .pipe(
                        map((updatedContact) => {
                            // Find the index of the updated contact
                            const index = contacts.findIndex(
                                (item) => item.id === id
                            );

                            // Update the contact
                            contacts[index] = updatedContact;

                            // Update the contacts
                            this._contactsSubject.next(contacts);

                            // Return the updated contact
                            return updatedContact;
                        }),
                        switchMap((updatedContact) =>
                            this.contact$.pipe(
                                take(1),
                                filter((item) => item && item.id === id),
                                tap(() => {
                                    // Update the contact if it's selected
                                    this._contactSubject.next(updatedContact);

                                    // Return the updated contact
                                    return updatedContact;
                                })
                            )
                        )
                    )
            )
        );
    }

    /**
     * Delete the contact
     *
     * @param id
     */
    deleteContact(id: string): Observable<boolean> {
        return this.contacts$.pipe(
            take(1),
            switchMap((contacts) =>
                this._http
                    .delete('api/apps/contacts/contact', { params: { id } })
                    .pipe(
                        map((isDeleted: boolean) => {
                            // Find the index of the deleted contact
                            const index = contacts.findIndex(
                                (item) => item.id === id
                            );

                            // Delete the contact
                            contacts.splice(index, 1);

                            // Update the contacts
                            this._contactsSubject.next(contacts);

                            // Return the deleted status
                            return isDeleted;
                        })
                    )
            )
        );
    }

    /**
     * Get countries
     */
    fetchCountries(): Observable<Country[]> {
        return this._http
            .get<Country[]>(`${API_URL}/metadata/countries`)
            .pipe(tap((countries) => this._countriesSubject.next(countries)));
    }

    /**
     * Get categories
     */
    fetchCategories(): Observable<Category[]> {
        return this._http
            .get<Category[]>(`${API_URL}/metadata/categories`)
            .pipe(
                tap((categories) => this._categoriesSubject.next(categories))
            );
    }
}
