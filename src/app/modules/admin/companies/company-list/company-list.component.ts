import { CdkScrollable } from '@angular/cdk/scrolling';
import { DecimalPipe, NgFor, NgIf } from '@angular/common';
import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
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
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { BehaviorSubject, combineLatest, Subject, takeUntil } from 'rxjs';
import { CompaniesService } from '../../companies/companies.service';
import { Company } from '../../companies/company.model';
import { ContactsService } from '../../contacts/contacts.service';

@Component({
    selector: 'app-company-list',
    standalone: true,
    imports: [
        NgIf,
        NgFor,
        RouterLink,
        DecimalPipe,
        MatIconModule,
        CdkScrollable,
        MatInputModule,
        MatSelectModule,
        MatButtonModule,
        MatOptionModule,
        MatTooltipModule,
        MatFormFieldModule,
        MatSlideToggleModule,
        MatProgressBarModule
    ],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './company-list.component.html'
})
export class CompanyListComponent implements OnInit, OnDestroy {
    startups: Company[];
    filteredStartups: Company[];
    filters: {
        categorySlug$: BehaviorSubject<string>;
        query$: BehaviorSubject<string>;
        confidentialityRequested$: BehaviorSubject<boolean>;
    } = {
        categorySlug$: new BehaviorSubject(''),
        query$: new BehaviorSubject(''),
        confidentialityRequested$: new BehaviorSubject(false)
    };

    private _unsubscribeAll: Subject<any> = new Subject<any>();

    /**
     * Constructor
     */
    constructor(
        private _activatedRoute: ActivatedRoute,
        private _changeDetectorRef: ChangeDetectorRef,
        private _router: Router,
        private _companyService: CompaniesService,
        private _contactsService: ContactsService
    ) {}

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void {
        // Get the courses
        this._companyService.startups$.pipe(takeUntil(this._unsubscribeAll)).subscribe((startups: Company[]) => {
            this.startups = this.filteredStartups = startups;

            // Mark for check
            this._changeDetectorRef.markForCheck();
        });

        // Filter the courses
        combineLatest([
            this.filters.categorySlug$,
            this.filters.query$,
            this.filters.confidentialityRequested$
        ]).subscribe(([categorySlug, query, confidentialityRequested]) => {
            // Reset the filtered courses
            this.filteredStartups = this.startups;

            // Filter by category
            if (categorySlug !== '') {
                this.filteredStartups = this.filteredStartups.filter(startup => startup.category === categorySlug);
            }

            // Filter by search query
            if (query !== '') {
                this.filteredStartups = this.filteredStartups.filter(
                    startup =>
                        startup.name.toLowerCase().includes(query.toLowerCase()) ||
                        startup.description.toLowerCase().includes(query.toLowerCase()) ||
                        startup.category.toLowerCase().includes(query.toLowerCase())
                );
            }

            // Filter by completed
            if (confidentialityRequested) {
                this.filteredStartups = this.filteredStartups.filter(
                    startup => startup.confidentialityRequested === confidentialityRequested
                );
            }
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
