import { inject } from '@angular/core';
import { Routes } from '@angular/router';
import { StartupsComponent } from './startups.component';
import { StartupListComponent } from './startup-list/startup-list.component';
import { CompaniesService } from '../companies/companies.service';

export default [
    {
        path: '',
        component: StartupsComponent,
        children: [
            {
                path: '',
                component: StartupListComponent,
                resolve: {
                    startups: () => inject(CompaniesService).fetchStartups()
                }
                // children: [
                //     {
                //         path: ':id',
                //         resolve: {
                //             contact: contactResolver,
                //             countries: () => inject(ContactsService).fetchCountries(),
                //             categories: () => inject(ContactsService).fetchCategories()
                //         },
                //         component: ContactDetailComponent,
                //         canDeactivate: [canDeactivateContactsDetails]
                //     }
                // ]
            }
        ]
    }
] as Routes;
