import { ActivatedRouteSnapshot, Router, RouterStateSnapshot, Routes } from '@angular/router';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { ConfigurationService } from './configuration.service';
import { ConfigurationComponent } from './configuration.component';

/**
 * Contact resolver
 *
 * @param route
 * @param state
 */
const configurationResolver = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
    const configurationService = inject(ConfigurationService);
    const router = inject(Router);

    return configurationService.fetchConfigurations().pipe(
        // Error here means the requested configuration is not available
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

export default [
    {
        path: '',
        component: ConfigurationComponent,
        resolve: {
            configurations: configurationResolver
        }
    }
] as Routes;
