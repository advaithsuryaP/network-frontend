import { Routes } from '@angular/router';
import { ContactsComponent } from './contacts.component';
import { ContactListComponent } from './contact-list/contact-list.component';
import { ContactDetailComponent } from './contact-detail/contact-detail.component';

export default [
    {
        path: '',
        component: ContactsComponent,
        children: [
            {
                path: '',
                component: ContactListComponent,
                children: [
                    {
                        path: ':id',
                        component: ContactDetailComponent,
                    },
                ],
            },
        ],
    },
] as Routes;
