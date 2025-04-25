import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Category, Contact, Country } from './contact.model';
import { BehaviorSubject, map, Observable, switchMap, tap, take, throwError, of, filter, pipe } from 'rxjs';
import { CreateContactPayload } from './contact.payload';

const API_URL = 'http://localhost:3000/api/v1';

@Injectable({
    providedIn: 'root'
})
export class ContactsService {
    private _http = inject(HttpClient);

    private _contactSubject: BehaviorSubject<Contact | null> = new BehaviorSubject(null);
    private _contactsSubject: BehaviorSubject<Contact[]> = new BehaviorSubject([]);
    private _countriesSubject: BehaviorSubject<Country[]> = new BehaviorSubject([]);
    private _categoriesSubject: BehaviorSubject<Category[]> = new BehaviorSubject([]);

    contact$: Observable<Contact> = this._contactSubject.asObservable();
    contacts$: Observable<Contact[]> = this._contactsSubject.asObservable();
    countries$: Observable<Country[]> = this._countriesSubject.asObservable();
    categories$: Observable<Category[]> = this._categoriesSubject.asObservable();

    fetchContacts(): Observable<Contact[]> {
        return this._http
            .get<Contact[]>(`${API_URL}/contacts`)
            .pipe(tap(contacts => this._contactsSubject.next(contacts)));
    }

    fetchContactById(id: string): Observable<Contact> {
        return this._contactsSubject.pipe(
            take(1),
            map(contacts => {
                // Find the contact
                const contact = contacts.find(item => item.id === id) || null;

                // Update the contact
                this._contactSubject.next(contact);

                // Return the contact
                return contact;
            }),
            switchMap(contact => {
                if (!contact) {
                    return throwError(() => new Error('No contact found with id ' + id));
                }

                return of(contact);
            })
        );
    }

    createContact(payload: CreateContactPayload): Observable<Contact> {
        return this.contacts$.pipe(
            take(1),
            switchMap(contacts =>
                this._http.post<Contact>(`${API_URL}/contacts`, payload).pipe(
                    map(newContact => {
                        // Update the contacts with the new contact
                        this._contactsSubject.next([...contacts, newContact]);

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
            switchMap(contacts =>
                this._http.patch<Contact>(`${API_URL}/contacts/${id}`, contact).pipe(
                    map(updatedContact => {
                        // Find the index of the updated contact
                        const index = contacts.findIndex(item => item.id === id);

                        // Update the contact
                        contacts[index] = updatedContact;

                        // Update the contacts
                        this._contactsSubject.next(contacts);

                        // Return the updated contact
                        return updatedContact;
                    }),
                    switchMap(updatedContact =>
                        this.contact$.pipe(
                            take(1),
                            filter(item => item && item.id === id),
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
            switchMap(contacts =>
                this._http.delete<{ success: boolean }>(`${API_URL}/contacts/${id}`).pipe(
                    map(({ success }) => {
                        // Find the index of the deleted contact
                        const index = contacts.findIndex(item => item.id === id);

                        // Delete the contact
                        contacts.splice(index, 1);

                        // Update the contacts
                        this._contactsSubject.next(contacts);

                        // Return the deleted status
                        return success;
                    })
                )
            )
        );
    }

    /**
     * Search contacts with given query
     *
     * @param query
     */
    searchContacts(query: string): Observable<Contact[]> {
        return this._http
            .get<Contact[]>(`${API_URL}/contacts/search`, {
                params: { query }
            })
            .pipe(
                tap(contacts => {
                    this._contactsSubject.next(contacts);
                })
            );
    }

    /**
     * Get countries
     */
    fetchCountries(): Observable<Country[]> {
        return this._http
            .get<Country[]>(`${API_URL}/metadata/countries`)
            .pipe(tap(countries => this._countriesSubject.next(countries)));
    }

    /**
     * Get categories
     */
    fetchCategories(): Observable<Category[]> {
        return this._http
            .get<Category[]>(`${API_URL}/metadata/categories`)
            .pipe(tap(categories => this._categoriesSubject.next(categories)));
    }
}
