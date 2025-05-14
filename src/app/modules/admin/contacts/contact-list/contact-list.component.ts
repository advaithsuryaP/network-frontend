import {
    OnInit,
    inject,
    Component,
    OnDestroy,
    ViewChild,
    ViewEncapsulation,
    ChangeDetectorRef,
    ChangeDetectionStrategy,
    ElementRef
} from '@angular/core';
import { Router, RouterLink, RouterOutlet, ActivatedRoute } from '@angular/router';
import { ContactsService } from '../contacts.service';
import {
    Observable,
    Subject,
    switchMap,
    takeUntil,
    map,
    finalize,
    combineLatest,
    startWith,
    debounceTime,
    distinctUntilChanged
} from 'rxjs';
import { Contact } from '../contact.model';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatDrawer, MatSidenavModule } from '@angular/material/sidenav';
import { NgIf, NgFor, NgClass, AsyncPipe, I18nPluralPipe } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { FuseMediaWatcherService } from '@fuse/services/media-watcher';
import { MatTooltipModule } from '@angular/material/tooltip';
import { HttpErrorResponse } from '@angular/common/http';
import { Configuration } from '../../configuration/configuration.model';
import { ConfigurationService } from '../../configuration/configuration.service';
import { ConfigurationCategoryEnum } from '../../configuration/configuration.enum';

@Component({
    selector: 'app-contact-list',
    standalone: true,
    imports: [
        NgIf,
        NgFor,
        NgClass,
        AsyncPipe,
        RouterLink,
        RouterOutlet,
        MatIconModule,
        I18nPluralPipe,
        MatInputModule,
        MatButtonModule,
        MatSidenavModule,
        MatTooltipModule,
        MatSnackBarModule,
        MatFormFieldModule,
        ReactiveFormsModule,
        MatSelectModule
    ],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './contact-list.component.html'
})
export class ContactListComponent implements OnInit, OnDestroy {
    @ViewChild('matDrawer', { static: true }) matDrawer: MatDrawer;
    @ViewChild('fileInput') fileInput: ElementRef;

    private _router = inject(Router);
    private _snackBar = inject(MatSnackBar);
    private _activatedRoute = inject(ActivatedRoute);
    private _contactsService = inject(ContactsService);
    private _changeDetectorRef = inject(ChangeDetectorRef);
    private _fuseMediaWatcherService = inject(FuseMediaWatcherService);
    private _configurationService = inject(ConfigurationService);

    private _unsubscribeAll: Subject<void> = new Subject<void>();

    isLoading: boolean = false;
    searchInputControl: FormControl<string> = new FormControl<string>('');
    contacts$: Observable<Contact[]> = this._contactsService.contacts$;
    selectedContact: Contact;

    contactsCount: number = 0;
    drawerMode: 'side' | 'over';

    // Filter controls
    companyCategoryFilter = new FormControl<string>('');
    primaryIndustryFilter = new FormControl<string>('');
    universityFilter = new FormControl<string>('');

    // Configuration data
    companyCategories: Configuration[] = [];
    primaryIndustries: Configuration[] = [];
    universities: Configuration[] = [];

    ngOnInit(): void {
        // Get configurations
        this._configurationService.configurations$.pipe(takeUntil(this._unsubscribeAll)).subscribe(configurations => {
            this.companyCategories = configurations.filter(
                config => config.category === ConfigurationCategoryEnum.COMPANY_CATEGORY
            );
            this.primaryIndustries = configurations.filter(
                config => config.category === ConfigurationCategoryEnum.PRIMARY_INDUSTRY
            );
            this.universities = configurations.filter(
                config => config.category === ConfigurationCategoryEnum.NETWORK_UNIVERSITY
            );
            this._changeDetectorRef.markForCheck();
        });

        // Combine all filters and search
        this.contacts$ = combineLatest([
            this._contactsService.contacts$,
            this.searchInputControl.valueChanges.pipe(
                startWith(''),
                debounceTime(300),
                distinctUntilChanged(),
                takeUntil(this._unsubscribeAll)
            ),
            this.companyCategoryFilter.valueChanges.pipe(takeUntil(this._unsubscribeAll), startWith('')),
            this.primaryIndustryFilter.valueChanges.pipe(takeUntil(this._unsubscribeAll), startWith('')),
            this.universityFilter.valueChanges.pipe(takeUntil(this._unsubscribeAll), startWith(''))
        ]).pipe(
            map(([contacts, searchQuery, companyCategory, primaryIndustry, university]) => {
                // Sort contacts alphabetically by first name
                let filteredContacts = [...contacts].sort((a, b) => {
                    return a.firstName.localeCompare(b.firstName);
                });

                // Apply search filter
                if (searchQuery) {
                    const query = searchQuery.toLowerCase();
                    filteredContacts = filteredContacts.filter(
                        contact =>
                            contact.firstName.toLowerCase().includes(query) ||
                            contact.lastName.toLowerCase().includes(query) ||
                            contact.title.toLowerCase().includes(query) ||
                            contact.notes.toLowerCase().includes(query) ||
                            contact.major.toLowerCase().includes(query)
                    );
                }

                // Apply company category filter
                if (companyCategory) {
                    filteredContacts = filteredContacts.filter(
                        contact => contact.company?.category === companyCategory
                    );
                }

                // Apply primary industry filter
                if (primaryIndustry) {
                    filteredContacts = filteredContacts.filter(
                        contact => contact.company?.primaryIndustry === primaryIndustry
                    );
                }

                // Apply university filter
                if (university) {
                    filteredContacts = filteredContacts.filter(contact => contact.university === university);
                }

                return filteredContacts;
            })
        );

        this._contactsService.contacts$.pipe(takeUntil(this._unsubscribeAll)).subscribe((contacts: Contact[]) => {
            // Update the counts
            this.contactsCount = contacts.length;

            // Mark for check
            this._changeDetectorRef.markForCheck();
        });

        // Get the contact
        this._contactsService.contact$.pipe(takeUntil(this._unsubscribeAll)).subscribe((contact: Contact) => {
            // Update the selected contact
            this.selectedContact = contact;

            // Mark for check
            this._changeDetectorRef.markForCheck();
        });

        // Subscribe to MatDrawer opened change
        this.matDrawer.openedChange.subscribe(opened => {
            if (!opened) {
                // Remove the selected contact when drawer closed
                this.selectedContact = null;

                // Mark for check
                this._changeDetectorRef.markForCheck();
            }
        });

        // Subscribe to media changes
        this._fuseMediaWatcherService.onMediaChange$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(({ matchingAliases }) => {
                // Set the drawerMode if the given breakpoint is active
                if (matchingAliases.includes('lg')) {
                    this.drawerMode = 'side';
                } else {
                    this.drawerMode = 'over';
                }

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });
    }

    onFileSelected(event: Event): void {
        const input = event.target as HTMLInputElement;
        if (input.files && input.files.length > 0) {
            const file = input.files[0];
            this.uploadFile(file);
        }
    }

    uploadFile(file: File): void {
        this.isLoading = true;
        this._changeDetectorRef.markForCheck();
        this._contactsService
            .uploadContacts(file)
            .pipe(
                finalize(() => {
                    this.isLoading = false;
                    this.fileInput.nativeElement.value = '';
                    this._changeDetectorRef.markForCheck();
                })
            )
            .subscribe({
                next: response => this._snackBar.open(response.message, 'Close', { duration: 3000 }),
                error: (error: HttpErrorResponse) => {
                    console.error('Error uploading contacts:', error);
                    this._snackBar.open(error.error.message, 'Close', { duration: 3000 });
                }
            });
    }

    /**
     * On backdrop clicked
     */
    onBackdropClicked(): void {
        // Go back to the list
        this._router.navigate(['./'], { relativeTo: this._activatedRoute });

        // Mark for check
        this._changeDetectorRef.markForCheck();
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
