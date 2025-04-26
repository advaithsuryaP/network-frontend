import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Contact, Country } from './contact.model';
import { BehaviorSubject, map, Observable, tap } from 'rxjs';
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

    contact$: Observable<Contact> = this._contactSubject.asObservable();
    contacts$: Observable<Contact[]> = this._contactsSubject.asObservable();
    countries$: Observable<Country[]> = this._countriesSubject.asObservable();

    /**
     * Fetch contacts
     */
    fetchContacts(): Observable<Contact[]> {
        return this._http
            .get<Contact[]>(`${API_URL}/contacts`)
            .pipe(tap(contacts => this._contactsSubject.next(contacts)));
    }

    /**
     * Fetch contact by ID
     *
     * @param id
     */
    fetchContactById(id: string): Observable<Contact> {
        return this._http
            .get<Contact>(`${API_URL}/contacts/${id}`)
            .pipe(tap(contact => this._contactSubject.next(contact)));
    }

    /**
     * Create contact
     *
     * @param payload
     */
    createContact(payload: CreateContactPayload): Observable<Contact> {
        return this._http.post<Contact>(`${API_URL}/contacts`, payload).pipe(
            tap(newContact => {
                // Get current contacts
                const currentContacts = this._contactsSubject.getValue();
                // Append new contacts to existing ones
                this._contactsSubject.next([...currentContacts, newContact]);
            })
        );
    }

    /**
     * Update contact
     *
     * @param id
     * @param contact
     */
    updateContact(id: string, contact: Contact): Observable<Contact> {
        return this._http.patch<Contact>(`${API_URL}/contacts/${id}`, contact).pipe(
            tap(updatedContact => {
                // Get current contacts
                const currentContacts = this._contactsSubject.getValue();

                // Find the index of the updated contact
                const index = currentContacts.findIndex(item => item.id === id);

                // Update the contact
                currentContacts[index] = updatedContact;

                // Update the contacts
                this._contactsSubject.next(currentContacts);

                // Return the updated contact
                return updatedContact;
            })
        );
    }

    /**
     * Delete the contact
     *
     * @param id
     */
    deleteContact(id: string): Observable<boolean> {
        return this._http.delete<{ success: boolean }>(`${API_URL}/contacts/${id}`).pipe(
            map(({ success }) => {
                // Get current contacts
                const currentContacts = this._contactsSubject.getValue();

                // Find the index of the deleted contact
                const index = currentContacts.findIndex(item => item.id === id);

                // Delete the contact
                currentContacts.splice(index, 1);

                // Update the contacts
                this._contactsSubject.next(currentContacts);

                // Return the deleted status
                return success;
            })
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
            .pipe(tap(contacts => this._contactsSubject.next(contacts)));
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
     * Upload contacts from Excel file
     *
     * @param file The Excel file to upload
     */
    uploadContacts(file: File): Observable<Contact[]> {
        const formData = new FormData();
        formData.append('file', file);

        return this._http.post<Contact[]>(`${API_URL}/contacts/upload`, formData).pipe(
            tap(newContacts => {
                // Get current contacts
                const currentContacts = this._contactsSubject.getValue();
                // Append new contacts to existing ones
                this._contactsSubject.next([...currentContacts, ...newContacts]);
            })
        );
    }
}
