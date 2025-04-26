import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    inject,
    OnInit,
    ViewEncapsulation
} from '@angular/core';
import { NgIf, NgFor } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';
import { ContactsService } from '../../contacts.service';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Contact, Country } from '../../contact.model';
import { Configuration } from '../../../configuration/configuration.model';
import { ConfigurationService } from '../../../configuration/configuration.service';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ConfigurationCategoryEnum } from '../../../configuration/configuration.enum';
@Component({
    selector: 'app-contact-preview',
    standalone: true,
    imports: [NgIf, NgFor, RouterLink, MatIconModule, MatButtonModule, MatTooltipModule],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './contact-preview.component.html'
})
export class ContactPreviewComponent implements OnInit {
    private _router = inject(Router);
    private _activatedRoute = inject(ActivatedRoute);
    private _contactsService = inject(ContactsService);
    private _changeDetectorRef = inject(ChangeDetectorRef);
    private _configurationService = inject(ConfigurationService);

    private _unsubscribeAll: Subject<void> = new Subject<void>();

    contact: Contact;
    countries: Country[] = [];

    labels: Configuration[] = [];
    companyCategories: Configuration[] = [];
    primaryIndustries: Configuration[] = [];

    ngOnInit(): void {
        // Get the contact
        this._contactsService.contact$.pipe(takeUntil(this._unsubscribeAll)).subscribe((contact: Contact) => {
            this.contact = contact;
            this._changeDetectorRef.markForCheck();
        });

        // Get the country telephone codes
        this._contactsService.countries$.pipe(takeUntil(this._unsubscribeAll)).subscribe((countries: Country[]) => {
            this.countries = countries;
            this._changeDetectorRef.markForCheck();
        });

        // Get labels
        this._configurationService
            .fetchConfigurations()
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(configurations => {
                this.labels = configurations.filter(config => config.category === ConfigurationCategoryEnum.LABELS);
                this.companyCategories = configurations.filter(
                    config => config.category === ConfigurationCategoryEnum.COMPANY_CATEGORY
                );
                this.primaryIndustries = configurations.filter(
                    config => config.category === ConfigurationCategoryEnum.PRIMARY_INDUSTRY
                );
                this._changeDetectorRef.markForCheck();
            });
    }

    editContact(): void {
        this._router.navigate(['edit'], { relativeTo: this._activatedRoute });
    }

    getCountryByIso(iso: string): Country {
        return this.countries.find(country => country.iso === iso);
    }

    getLabelById(id: string): string {
        return this.labels.find(label => label.id === id)?.label || '';
    }

    getCompanyCategoryById(id: string): string {
        return this.companyCategories.find(category => category.id === id)?.label || '';
    }

    getPrimaryIndustryById(id: string): string {
        return this.primaryIndustries.find(industry => industry.id === id)?.label || '';
    }

    /**
     * Track by function for ngFor loops
     *
     * @param index
     * @param item
     */
    trackByFn(index: number, item: any): any {
        return item.id || index;
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }
}
