import { inject } from '@angular/core';
import { CompaniesComponent } from './companies.component';
import { CompanyListComponent } from './company-list/company-list.component';
import { CompaniesService } from './companies.service';
import { Routes } from '@angular/router';
import { ConfigurationService } from '../configuration/configuration.service';

export default [
    {
        path: '',
        component: CompaniesComponent,
        children: [
            {
                path: '',
                component: CompanyListComponent,
                resolve: {
                    companies: () => inject(CompaniesService).fetchCompanies(),
                    configurations: () => inject(ConfigurationService).fetchConfigurations()
                }
            }
        ]
    }
] as Routes;
