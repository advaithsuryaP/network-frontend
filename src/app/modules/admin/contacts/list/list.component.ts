import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    inject,
    OnDestroy,
    OnInit,
    ViewChild,
} from '@angular/core';
import {
    ActivatedRoute,
    Router,
    RouterLink,
    RouterOutlet,
} from '@angular/router';
import { ContactsService } from '../contacts.service';
import { Subject, switchMap, takeUntil } from 'rxjs';
import { Contact } from '../contacts.model';

import { MatDrawer, MatSidenavModule } from '@angular/material/sidenav';
import {
    AsyncPipe,
    I18nPluralPipe,
    NgClass,
    NgFor,
    NgIf,
} from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';

@Component({
    selector: 'app-list',
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
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
        ReactiveFormsModule,
    ],
    templateUrl: './list.component.html',
})
export class ListComponent implements OnInit, OnDestroy {
    @ViewChild('matDrawer', { static: true }) matDrawer: MatDrawer;

    private _router = inject(Router);
    private _activatedRoute = inject(ActivatedRoute);
    private _changeDetectorRef = inject(ChangeDetectorRef);
    private _contactsService = inject(ContactsService);

    private _unsubscribeAll: Subject<void> = new Subject<void>();

    searchInputControl: FormControl<string> = new FormControl<string>('');
    contacts$ = this._contactsService.contacts$;
    selectedContact: Contact;

    contactsCount: number = 0;
    drawerMode: 'side' | 'over';

    ngOnInit(): void {
        this.contacts$ = this._contactsService.contacts$;
        this._contactsService.contacts$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((contacts: Contact[]) => {
                // Update the counts
                this.contactsCount = contacts.length;

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        // // Subscribe to search input field value changes
        // this.searchInputControl.valueChanges
        //     .pipe(
        //         takeUntil(this._unsubscribeAll),
        //         switchMap((query) =>
        //             // Search
        //             this._contactsService.searchContacts(query)
        //         )
        //     )
        //     .subscribe();
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
     * Create contact
     */
    createContact(): void {
        // Create the contact
        // this._contactsService.createContact().subscribe((newContact) => {
        //     // Go to the new contact
        //     this._router.navigate(['./', newContact.id], {
        //         relativeTo: this._activatedRoute,
        //     });
        //     // Mark for check
        //     this._changeDetectorRef.markForCheck();
        // });
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

    ngOnDestroy(): void {}
}
