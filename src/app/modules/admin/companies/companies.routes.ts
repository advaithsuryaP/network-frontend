import { inject } from '@angular/core';
import { CompaniesComponent } from './companies.component';
import { CompanyListComponent } from './company-list/company-list.component';
import { CompaniesService } from './companies.service';
import { Routes } from '@angular/router';

export default [
    {
        path: '',
        component: CompaniesComponent,
        children: [
            {
                path: '',
                component: CompanyListComponent,
                resolve: {
                    companies: () => inject(CompaniesService).fetchCompanies()
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
