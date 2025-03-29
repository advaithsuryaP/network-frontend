import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Contact } from './contacts.model';
import { BehaviorSubject, Observable, tap } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class ContactsService {
    // private _http = inject(HttpClient);
    // private _contacts: BehaviorSubject<Contact[] | null> = new BehaviorSubject(
    //     null
    // );
    // getContacts(): Observable<Contact[]> {
    //     return this._http
    //         .get<Contact[]>('/api/v1/contacts')
    //         .pipe(tap((contacts) => this._contacts.next(contacts)));
    // }
    // getContact(id: string) {
    //     return this._http.get(`/api/contacts/${id}`);
    // }
    // createContact(contact: any) {
    //     return this._http.post('/api/contacts', contact);
    // }
    // updateContact(id: string, contact: any) {
    //     return this._http.put(`/api/contacts/${id}`, contact);
    // }
    // deleteContact(id: string) {
    //     return this._http.delete(`/api/contacts/${id}`);
    // }
    // getCompanies() {
    //     return this._http.get('/api/companies');
    // }
    // getCompany(id: string) {
    //     return this._http.get(`/api/companies/${id}`);
    // }
    // createCompany(company: any) {
    //     return this._http.post('/api/companies', company);
    // }
    // updateCompany(id: string, company: any) {
    //     return this._http.put(`/api/companies/${id}`, company);
    // }
    // deleteCompany(id: string) {
    //     return this._http.delete(`/api/companies/${id}`);
    // }
}
