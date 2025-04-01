import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ElementRef,
    inject,
    OnDestroy,
    OnInit,
    ViewChild,
    ViewEncapsulation,
} from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';
import { ContactsService } from '../contacts.service';
import { ContactListComponent } from '../contact-list/contact-list.component';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Category, Contact, Country } from '../contacts.model';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import {
    FormArray,
    FormControl,
    FormGroup,
    ReactiveFormsModule,
    Validators,
} from '@angular/forms';
import { MatDrawerToggleResult } from '@angular/material/sidenav';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatRippleModule } from '@angular/material/core';
import { MatRadioModule } from '@angular/material/radio';

interface EmailFormGroup {
    label: FormControl<string>;
    email: FormControl<string>;
}

interface PhoneNumberFormGroup {
    label: FormControl<string>;
    countryCode: FormControl<string>;
    phoneNumber: FormControl<string>;
}

interface ContactForm {
    id: FormControl<string>;
    avatar: FormControl<string | null>;
    firstName: FormControl<string | null>;
    lastName: FormControl<string | null>;
    emails: FormArray<FormGroup<EmailFormGroup>>;
    phoneNumbers: FormArray<FormGroup<PhoneNumberFormGroup>>;
    notes: FormControl<string | null>;
    title: FormControl<string | null>;
    major: FormControl<string | null>;
    companyId: FormControl<string | null>;
    company: FormGroup<{
        name: FormControl<string | null>;
        alternateName: FormControl<string | null>;
        description: FormControl<string | null>;
        website: FormControl<string | null>;
        category: FormControl<string | null>;
        primaryIndustry: FormControl<string | null>;
        secondaryIndustry: FormControl<string | null>;
        attractedOutOfState: FormControl<boolean | null>;
        confidentialityRequested: FormControl<boolean | null>;
        intellectualProperty: FormControl<string | null>;
        departmentIfFaculty: FormControl<string | null>;
        pointOfContactName: FormControl<string | null>;
        pointOfContactEmail: FormControl<string | null>;
        pointOfContactPhone: FormControl<string | null>;
        usmFounders: FormControl<string | null>;
        miscResources: FormControl<string | null>;
        preCompanyResources: FormControl<string | null>;
        preCompanyFunding: FormControl<number | null>;
        icorps: FormControl<boolean | null>;
        tcf: FormControl<boolean | null>;
        tcfAmount: FormControl<number | null>;
        comments: FormControl<string | null>;
    }>;
}

@Component({
    selector: 'app-contact-detail',
    standalone: true,
    imports: [
        NgIf,
        NgFor,
        RouterLink,
        MatIconModule,
        MatInputModule,
        MatSelectModule,
        MatButtonModule,
        MatRippleModule,
        MatTooltipModule,
        MatFormFieldModule,
        MatRadioModule,
        ReactiveFormsModule,
    ],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './contact-detail.component.html',
})
export class ContactDetailComponent implements OnInit, OnDestroy {
    @ViewChild('avatarFileInput') private _avatarFileInput: ElementRef;

    private _router = inject(Router);
    private _activatedRoute = inject(ActivatedRoute);
    private _contactsService = inject(ContactsService);
    private _changeDetectorRef = inject(ChangeDetectorRef);
    private _contactsListComponent = inject(ContactListComponent);
    private _fuseConfirmationService = inject(FuseConfirmationService);

    editMode: boolean = false;
    // tags: Tag[];
    tagsEditMode: boolean = false;
    // filteredTags: Tag[];
    contact: Contact;
    // contactForm: UntypedFormGroup;
    contacts: Contact[];
    countries: Country[] = [];
    categories: Category[] = [];

    contactForm = new FormGroup<ContactForm>({
        id: new FormControl<string>(''),
        avatar: new FormControl<string | null>(null),
        firstName: new FormControl<string | null>('', Validators.required),
        lastName: new FormControl<string | null>('', Validators.required),
        emails: new FormArray<FormGroup<EmailFormGroup>>([]),
        phoneNumbers: new FormArray<FormGroup<PhoneNumberFormGroup>>([]),
        notes: new FormControl<string | null>(''),
        title: new FormControl<string | null>('', Validators.required),
        major: new FormControl<string | null>(''),
        companyId: new FormControl<string | null>(''),
        company: new FormGroup({
            name: new FormControl<string | null>('', Validators.required),
            alternateName: new FormControl<string | null>(''),
            description: new FormControl<string | null>(''),
            website: new FormControl<string | null>(''),
            category: new FormControl<string>('', {
                validators: [Validators.required],
                nonNullable: true,
            }),
            primaryIndustry: new FormControl<string>('', {
                validators: [Validators.required],
                nonNullable: true,
            }),
            secondaryIndustry: new FormControl<string>('', {
                validators: [Validators.required],
                nonNullable: true,
            }),
            attractedOutOfState: new FormControl<boolean | null>(false),
            confidentialityRequested: new FormControl<boolean | null>(false),
            intellectualProperty: new FormControl<string | null>(''),
            departmentIfFaculty: new FormControl<string | null>(''),
            pointOfContactName: new FormControl<string | null>(''),
            pointOfContactEmail: new FormControl<string | null>(''),
            pointOfContactPhone: new FormControl<string | null>(''),
            usmFounders: new FormControl<string | null>(''),
            miscResources: new FormControl<string | null>(''),
            preCompanyResources: new FormControl<string | null>(''),
            preCompanyFunding: new FormControl<number | null>(null),
            icorps: new FormControl<boolean | null>(false),
            tcf: new FormControl<boolean | null>(false),
            tcfAmount: new FormControl<number | null>(null),
            comments: new FormControl<string | null>(''),
        }),
    });

    private _unsubscribeAll: Subject<void> = new Subject<void>();

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void {
        // Open the drawer
        this._contactsListComponent.matDrawer.open();

        // Get the contacts
        this._contactsService.contacts$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((contacts: Contact[]) => {
                this.contacts = contacts;

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        // Get the contact
        this._contactsService.contact$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((contact: Contact) => {
                // Open the drawer in case it is closed
                this._contactsListComponent.matDrawer.open();

                // Get the contact
                this.contact = contact;
                console.log(contact);

                // Clear the emails and phoneNumbers form arrays
                this.contactForm.controls.emails.clear();
                this.contactForm.controls.phoneNumbers.clear();

                // Patch values to the form
                this.contactForm.patchValue({
                    id: contact.id,
                    firstName: contact.firstName,
                    lastName: contact.lastName,
                    title: contact.title,
                    notes: contact.notes,
                    major: contact.major,
                    companyId: contact.companyId,
                });

                this.contactForm.controls.company.patchValue({
                    name: contact.company.name,
                    description: contact.company.description,
                    website: contact.company.website,
                    category: contact.company.category,
                    primaryIndustry: contact.company.primaryIndustry,
                    secondaryIndustry: contact.company.secondaryIndustry,
                    attractedOutOfState: contact.company.attractedOutOfState,
                    confidentialityRequested:
                        contact.company.confidentialityRequested,
                    intellectualProperty: contact.company.intellectualProperty,
                    departmentIfFaculty: contact.company.departmentIfFaculty,
                    pointOfContactName: contact.company.pointOfContactName,
                    pointOfContactEmail: contact.company.pointOfContactEmail,
                    pointOfContactPhone: contact.company.pointOfContactPhone,
                    usmFounders: contact.company.usmFounders,
                    miscResources: contact.company.miscResources,
                    preCompanyResources: contact.company.preCompanyResources,
                    preCompanyFunding: contact.company.preCompanyFunding,
                    icorps: contact.company.icorps,
                    tcf: contact.company.tcf,
                    tcfAmount: contact.company.tcfAmount,
                    comments: contact.company.comments,
                });

                if (contact.emails.length > 0) {
                    // Iterate through them
                    contact.emails.forEach((email) => {
                        this.contactForm.controls.emails.push(
                            new FormGroup<EmailFormGroup>({
                                label: new FormControl<string>(email.label, {
                                    validators: [Validators.required],
                                    nonNullable: true,
                                }),
                                email: new FormControl<string>(email.email, {
                                    validators: [Validators.required],
                                    nonNullable: true,
                                }),
                            })
                        );
                    });
                } else {
                    // Create an email form group
                    this.contactForm.controls.emails.push(
                        new FormGroup<EmailFormGroup>({
                            label: new FormControl<string>('', {
                                validators: [Validators.required],
                                nonNullable: true,
                            }),
                            email: new FormControl<string>('', {
                                validators: [Validators.required],
                                nonNullable: true,
                            }),
                        })
                    );
                }

                if (contact.phoneNumbers.length > 0) {
                    // Iterate through them
                    contact.phoneNumbers.forEach((phoneNumber) => {
                        // Create an email form group
                        this.contactForm.controls.phoneNumbers.push(
                            new FormGroup<PhoneNumberFormGroup>({
                                countryCode: new FormControl<string>(
                                    phoneNumber.countryCode,
                                    {
                                        validators: [Validators.required],
                                        nonNullable: true,
                                    }
                                ),
                                phoneNumber: new FormControl<string>(
                                    phoneNumber.phoneNumber,
                                    {
                                        validators: [Validators.required],
                                        nonNullable: true,
                                    }
                                ),
                                label: new FormControl<string>(
                                    phoneNumber.label,
                                    {
                                        validators: [Validators.required],
                                        nonNullable: true,
                                    }
                                ),
                            })
                        );
                    });
                } else {
                    // Create a phone number form group
                    this.contactForm.controls.phoneNumbers.push(
                        new FormGroup<PhoneNumberFormGroup>({
                            countryCode: new FormControl<string>('us', {
                                validators: [Validators.required],
                                nonNullable: true,
                            }),
                            phoneNumber: new FormControl<string>('', {
                                validators: [Validators.required],
                                nonNullable: true,
                            }),
                            label: new FormControl<string>('', {
                                validators: [Validators.required],
                                nonNullable: true,
                            }),
                        })
                    );
                }

                // Toggle the edit mode off
                this.toggleEditMode(false);

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        // Get the country telephone codes
        this._contactsService.countries$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((countries: Country[]) => {
                this.countries = countries;

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        this._contactsService.categories$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((categories: Category[]) => {
                this.categories = categories;

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });
    }

    /**
     * On destroy
     */
    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Close the drawer
     */
    closeDrawer(): Promise<MatDrawerToggleResult> {
        return this._contactsListComponent.matDrawer.close();
    }

    /**
     * Toggle edit mode
     *
     * @param editMode
     */
    toggleEditMode(editMode: boolean | null = null): void {
        if (editMode === null) {
            this.editMode = !this.editMode;
        } else {
            this.editMode = editMode;
        }

        // Mark for check
        this._changeDetectorRef.markForCheck();
    }

    /**
     * Update the contact
     */
    updateContact(): void {
        console.log(this.contactForm.errors);

        // // Get the contact object
        // const contact = this.contactForm.getRawValue();
        // // Go through the contact object and clear empty values
        // contact.emails = contact.emails.filter((email) => email.email);
        // contact.phoneNumbers = contact.phoneNumbers.filter(
        //     (phoneNumber) => phoneNumber.phoneNumber
        // );
        // // Update the contact on the server
        // this._contactsService
        //     .updateContact(contact.id, contact)
        //     .subscribe(() => {
        //         // Toggle the edit mode off
        //         this.toggleEditMode(false);
        //     });
    }

    /**
     * Delete the contact
     */
    deleteContact(): void {
        // Open the confirmation dialog
        const confirmation = this._fuseConfirmationService.open({
            title: 'Delete contact',
            message:
                'Are you sure you want to delete this contact? This action cannot be undone!',
            actions: {
                confirm: {
                    label: 'Delete',
                },
            },
        });

        // Subscribe to the confirmation dialog closed action
        confirmation.afterClosed().subscribe((result) => {
            // If the confirm button pressed...
            if (result === 'confirmed') {
                // Get the current contact's id
                const id = this.contact.id;

                // Get the next/previous contact's id
                const currentContactIndex = this.contacts.findIndex(
                    (item) => item.id === id
                );
                const nextContactIndex =
                    currentContactIndex +
                    (currentContactIndex === this.contacts.length - 1 ? -1 : 1);
                const nextContactId =
                    this.contacts.length === 1 && this.contacts[0].id === id
                        ? null
                        : this.contacts[nextContactIndex].id;

                // Delete the contact
                this._contactsService
                    .deleteContact(id)
                    .subscribe((isDeleted) => {
                        // Return if the contact wasn't deleted...
                        if (!isDeleted) {
                            return;
                        }

                        // Navigate to the next contact if available
                        if (nextContactId) {
                            this._router.navigate(['../', nextContactId], {
                                relativeTo: this._activatedRoute,
                            });
                        }
                        // Otherwise, navigate to the parent
                        else {
                            this._router.navigate(['../'], {
                                relativeTo: this._activatedRoute,
                            });
                        }

                        // Toggle the edit mode off
                        this.toggleEditMode(false);
                    });

                // Mark for check
                this._changeDetectorRef.markForCheck();
            }
        });
    }

    /**
     * Upload avatar
     *
     * @param fileList
     */
    uploadAvatar(fileList: FileList): void {
        // Return if canceled
        if (!fileList.length) {
            return;
        }

        const allowedTypes = ['image/jpeg', 'image/png'];
        const file = fileList[0];

        // Return if the file is not allowed
        if (!allowedTypes.includes(file.type)) {
            return;
        }

        // Upload the avatar
        // this._contactsService.uploadAvatar(this.contact.id, file).subscribe();
    }

    /**
     * Remove the avatar
     */
    removeAvatar(): void {
        // Get the form control for 'avatar'
        const avatarFormControl = this.contactForm.get('avatar');

        // Set the avatar as null
        // avatarFormControl.setValue(null);

        // Set the file input value as null
        this._avatarFileInput.nativeElement.value = null;

        // Update the contact
        this.contact.avatar = null;
    }

    /**
     * Add the email field
     */
    addEmailField(): void {
        // Create an empty email form group
        this.contactForm.controls.emails.push(
            new FormGroup<EmailFormGroup>({
                label: new FormControl<string>('', {
                    validators: [Validators.required],
                    nonNullable: true,
                }),
                email: new FormControl<string>('', {
                    validators: [Validators.required],
                    nonNullable: true,
                }),
            })
        );
        // Mark for check
        this._changeDetectorRef.markForCheck();
    }

    /**
     * Remove the email field
     *
     * @param index
     */
    removeEmailField(index: number): void {
        this.contactForm.controls.emails.removeAt(index);
        // Mark for check
        this._changeDetectorRef.markForCheck();
    }

    /**
     * Add an empty phone number field
     */
    addPhoneNumberField(): void {
        // Create an empty phone number form group
        this.contactForm.controls.phoneNumbers.push(
            new FormGroup<PhoneNumberFormGroup>({
                countryCode: new FormControl<string>('us', {
                    validators: [Validators.required],
                    nonNullable: true,
                }),
                phoneNumber: new FormControl<string>('', {
                    validators: [Validators.required],
                    nonNullable: true,
                }),
                label: new FormControl<string>('', {
                    validators: [Validators.required],
                    nonNullable: true,
                }),
            })
        );
        // Mark for check
        this._changeDetectorRef.markForCheck();
    }

    /**
     * Remove the phone number field
     *
     * @param index
     */
    removePhoneNumberField(index: number): void {
        this.contactForm.controls.phoneNumbers.removeAt(index);
        // Mark for check
        this._changeDetectorRef.markForCheck();
    }

    /**
     * Get country info by iso code
     *
     * @param iso
     */
    getCountryByIso(iso: string): Country {
        return this.countries.find((country) => country.iso === iso);
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
}
