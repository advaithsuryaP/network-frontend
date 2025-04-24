import {
    OnInit,
    inject,
    Component,
    OnDestroy,
    ViewChild,
    ViewEncapsulation,
    ChangeDetectorRef,
    ChangeDetectionStrategy
} from '@angular/core';
import { Router, RouterLink, RouterOutlet, ActivatedRoute } from '@angular/router';
import { ContactsService } from '../contacts.service';
import { Observable, Subject, switchMap, takeUntil, map } from 'rxjs';
import { Contact } from '../contact.model';

import { MatDrawer, MatSidenavModule } from '@angular/material/sidenav';
import { NgIf, NgFor, NgClass, AsyncPipe, I18nPluralPipe } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { FuseMediaWatcherService } from '@fuse/services/media-watcher';

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
        MatFormFieldModule,
        ReactiveFormsModule
    ],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './contact-list.component.html'
})
export class ContactListComponent implements OnInit, OnDestroy {
    @ViewChild('matDrawer', { static: true }) matDrawer: MatDrawer;

    private _router = inject(Router);
    private _activatedRoute = inject(ActivatedRoute);
    private _contactsService = inject(ContactsService);
    private _changeDetectorRef = inject(ChangeDetectorRef);
    private _fuseMediaWatcherService = inject(FuseMediaWatcherService);

    private _unsubscribeAll: Subject<void> = new Subject<void>();

    searchInputControl: FormControl<string> = new FormControl<string>('');
    contacts$: Observable<Contact[]> = this._contactsService.contacts$;
    selectedContact: Contact;

    contactsCount: number = 0;
    drawerMode: 'side' | 'over';

    ngOnInit(): void {
        this.contacts$ = this._contactsService.contacts$.pipe(
            map(contacts => {
                // Sort contacts alphabetically by first name
                return [...contacts].sort((a, b) => {
                    return a.firstName.localeCompare(b.firstName);
                });
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

        // // Subscribe to search input field value changes
        this.searchInputControl.valueChanges
            .pipe(
                takeUntil(this._unsubscribeAll),
                switchMap(query =>
                    // Search
                    this._contactsService.searchContacts(query)
                )
            )
            .subscribe();

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
