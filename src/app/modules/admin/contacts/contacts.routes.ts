import { Routes } from '@angular/router';
import { ContactsComponent } from './contacts.component';
import { ListComponent } from './list/list.component';
import { DetailsComponent } from './details/details.component';

export default [
    {
        path: '',
        component: ContactsComponent,
        children: [
            {
                path: '',
                component: ListComponent,
                children: [
                    {
                        path: ':id',
                        component: DetailsComponent,
                    },
                ],
            },
        ],
    },
] as Routes;
