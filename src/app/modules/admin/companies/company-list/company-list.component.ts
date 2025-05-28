import { CdkScrollable } from '@angular/cdk/scrolling';
import { DecimalPipe, NgFor, NgIf } from '@angular/common';
import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    inject,
    OnDestroy,
    OnInit,
    ViewEncapsulation
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatOptionModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectChange, MatSelectModule } from '@angular/material/select';
import { MatSlideToggleChange, MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';
import { BehaviorSubject, combineLatest, finalize, Subject, takeUntil } from 'rxjs';
import { CompaniesService } from '../../companies/companies.service';
import { Company } from '../../companies/company.model';
import { ContactsService } from '../../contacts/contacts.service';
import { Configuration } from '../../configuration/configuration.model';
import { ConfigurationService } from '../../configuration/configuration.service';
import { ConfigurationCategoryEnum } from '../../configuration/configuration.enum';
import { Contact } from '../../contacts/contact.model';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
    selector: 'app-company-list',
    standalone: true,
    imports: [
        NgIf,
        NgFor,
        DecimalPipe,
        MatIconModule,
        CdkScrollable,
        MatInputModule,
        MatSelectModule,
        MatButtonModule,
        MatOptionModule,
        MatTooltipModule,
        MatSnackBarModule,
        MatFormFieldModule,
        MatSlideToggleModule,
        MatProgressBarModule
    ],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './company-list.component.html'
})
export class CompanyListComponent implements OnInit, OnDestroy {
    private _snackBar = inject(MatSnackBar);
    private _contactsService = inject(ContactsService);
    private _companiesService = inject(CompaniesService);
    private _changeDetectorRef = inject(ChangeDetectorRef);
    private _configurationService = inject(ConfigurationService);

    contacts: Contact[] = [];
    companies: Company[] = [];
    filteredCompanies: Company[] = [];

    filters: {
        categorySlug$: BehaviorSubject<string>;
        query$: BehaviorSubject<string>;
        confidentialityRequested$: BehaviorSubject<boolean>;
    } = {
        categorySlug$: new BehaviorSubject(''),
        query$: new BehaviorSubject(''),
        confidentialityRequested$: new BehaviorSubject(false)
    };

    contactLabels: Configuration[] = [];
    companyCategories: Configuration[] = [];
    primaryIndustries: Configuration[] = [];

    private _unsubscribeAll: Subject<null> = new Subject<null>();

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void {
        // Get the companies
        this._companiesService.companies$.pipe(takeUntil(this._unsubscribeAll)).subscribe((companies: Company[]) => {
            this.companies = this.filteredCompanies = companies;

            // Mark for check
            this._changeDetectorRef.markForCheck();
        });

        this._contactsService.contacts$.pipe(takeUntil(this._unsubscribeAll)).subscribe((contacts: Contact[]) => {
            this.contacts = contacts;

            // Mark for check
            this._changeDetectorRef.markForCheck();
        });

        this._configurationService.configurations$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((configurations: Configuration[]) => {
                this.contactLabels = configurations.filter(
                    config => config.category === ConfigurationCategoryEnum.CONTACT_LABELS
                );
                this.companyCategories = configurations.filter(
                    config => config.category === ConfigurationCategoryEnum.COMPANY_CATEGORY
                );
                this.primaryIndustries = configurations.filter(
                    config => config.category === ConfigurationCategoryEnum.PRIMARY_INDUSTRY
                );
            });

        // Filter the courses
        combineLatest([this.filters.categorySlug$, this.filters.query$]).subscribe(([categorySlug, query]) => {
            // Reset the filtered courses
            this.filteredCompanies = this.companies;

            // Filter by category
            if (categorySlug !== '') {
                this.filteredCompanies = this.filteredCompanies.filter(company => company.category === categorySlug);
            }

            // Filter by search query
            if (query !== '') {
                this.filteredCompanies = this.filteredCompanies.filter(
                    company =>
                        company.name.toLowerCase().includes(query.toLowerCase()) ||
                        company.description.toLowerCase().includes(query.toLowerCase()) ||
                        company.category.toLowerCase().includes(query.toLowerCase())
                );
            }

            // Mark for check
            this._changeDetectorRef.markForCheck();
        });
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Filter by search query
     *
     * @param query
     */
    filterByQuery(query: string): void {
        this.filters.query$.next(query);
    }

    /**
     * Filter by category
     *
     * @param change
     */
    filterByCategory(change: MatSelectChange): void {
        this.filters.categorySlug$.next(change.value);
    }

    /**
     * Show/hide completed courses
     *
     * @param change
     */
    toggleConfidentialityRequested(change: MatSlideToggleChange): void {
        this.filters.confidentialityRequested$.next(change.checked);
    }

    getCompanyCategoryById(id: string): string {
        return this.companyCategories.find(category => category.id === id)?.label || '';
    }

    getPrimaryIndustryById(id: string): string {
        return this.primaryIndustries.find(industry => industry.id === id)?.label || '';
    }

    getContactById(id: string): string {
        return (
            this.contacts.find(contact => contact.id === id)?.firstName +
            ' ' +
            this.contacts.find(contact => contact.id === id)?.lastName
        );
    }

    deleteCompany(id: string): void {
        this._companiesService
            .deleteCompany(id)
            .pipe(finalize(() => this._changeDetectorRef.markForCheck()))
            .subscribe({
                next: response => {
                    this._snackBar.open(response.message, 'Close', {
                        duration: 3000
                    });
                },
                error: (error: HttpErrorResponse) => {
                    this._snackBar.open(error.error.message, 'Close', {
                        duration: 3000
                    });
                }
            });
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

    /**
     * On destroy
     */
    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }
}
