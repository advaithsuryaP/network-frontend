import { ActivatedRouteSnapshot, Router, RouterStateSnapshot, Routes } from '@angular/router';
import { ContactsComponent } from './contacts.component';
import { ContactListComponent } from './contact-list/contact-list.component';
import { ContactDetailComponent } from './contact-detail/contact-detail.component';
import { ContactPreviewComponent } from './contact-detail/contact-preview/contact-preview.component';
import { ContactEditComponent } from './contact-detail/contact-edit/contact-edit.component';
import { inject } from '@angular/core';
import { ContactsService } from './contacts.service';
import { catchError, throwError } from 'rxjs';
import { ConfigurationService } from '../configuration/configuration.service';

/**
 * Contact resolver
 *
 * @param route
 * @param state
 */
const contactResolver = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
    const contactsService = inject(ContactsService);
    const router = inject(Router);

    return contactsService.fetchContactById(route.paramMap.get('id')).pipe(
        // Error here means the requested contact is not available
        catchError(error => {
            // Log the error
            console.error(error);

            // Get the parent url
            const parentUrl = state.url.split('/').slice(0, -1).join('/');

            // Navigate to there
            router.navigateByUrl(parentUrl);

            // Throw an error
            return throwError(() => error);
        })
    );
};

/**
 * Can deactivate contacts details
 *
 * @param component
 * @param currentRoute
 * @param currentState
 * @param nextState
 */
const canDeactivateContactsDetails = (
    component: ContactDetailComponent,
    currentRoute: ActivatedRouteSnapshot,
    currentState: RouterStateSnapshot,
    nextState: RouterStateSnapshot
) => {
    // Get the next route
    let nextRoute: ActivatedRouteSnapshot = nextState.root;
    while (nextRoute.firstChild) {
        nextRoute = nextRoute.firstChild;
    }

    // If the next state doesn't contain '/contacts'
    // it means we are navigating away from the
    // contacts app
    if (!nextState.url.includes('/contacts')) {
        // Let it navigate
        return true;
    }

    // If we are navigating to another contact or to a new contact...
    if (nextRoute.paramMap.get('id') || nextState.url.includes('new')) {
        // Just navigate
        return true;
    }

    // Otherwise, close the drawer first, and then navigate
    return component.closeDrawer().then(() => true);
};

export default [
    {
        path: '',
        component: ContactsComponent,
        children: [
            {
                path: '',
                component: ContactListComponent,
                resolve: {
                    contacts: () => inject(ContactsService).fetchContacts(),
                    configurations: () => inject(ConfigurationService).fetchConfigurations()
                },
                children: [
                    {
                        path: 'edit',
                        component: ContactDetailComponent,
                        canDeactivate: [canDeactivateContactsDetails],
                        children: [
                            {
                                path: 'new',
                                component: ContactEditComponent,
                                resolve: {
                                    countries: () => inject(ContactsService).fetchCountries(),
                                    configurations: () => inject(ConfigurationService).fetchConfigurations()
                                }
                            },
                            {
                                path: ':id',
                                component: ContactEditComponent,
                                resolve: {
                                    contact: contactResolver,
                                    countries: () => inject(ContactsService).fetchCountries(),
                                    configurations: () => inject(ConfigurationService).fetchConfigurations()
                                }
                            }
                        ]
                    },
                    {
                        path: 'view',
                        component: ContactDetailComponent,
                        canDeactivate: [canDeactivateContactsDetails],
                        children: [
                            {
                                path: ':id',
                                component: ContactPreviewComponent,
                                resolve: {
                                    contact: contactResolver,
                                    countries: () => inject(ContactsService).fetchCountries(),
                                    configurations: () => inject(ConfigurationService).fetchConfigurations()
                                }
                            }
                        ]
                    }
                ]
            }
        ]
    }
] as Routes;
