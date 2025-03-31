import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ElementRef,
    inject,
    OnDestroy,
    OnInit,
    Renderer2,
    TemplateRef,
    ViewChild,
    ViewContainerRef,
    ViewEncapsulation,
} from '@angular/core';
import { JsonPipe, NgFor, NgIf } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { ContactsService } from '../contacts.service';
import { ContactListComponent } from '../contact-list/contact-list.component';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Contact, Country } from '../contacts.model';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import {
    FormArray,
    FormControl,
    FormGroup,
    ReactiveFormsModule,
    Validators,
} from '@angular/forms';
import { MatDrawerToggleResult } from '@angular/material/sidenav';
import { TemplatePortal } from '@angular/cdk/portal';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTooltipModule } from '@angular/material/tooltip';

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
    graduationYear: FormControl<string | null>;
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
        MatButtonModule,
        MatTooltipModule,
        MatFormFieldModule,
        ReactiveFormsModule,
    ],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './contact-detail.component.html',
})
export class ContactDetailComponent implements OnInit, OnDestroy {
    @ViewChild('avatarFileInput') private _avatarFileInput: ElementRef;
    @ViewChild('tagsPanel') private _tagsPanel: TemplateRef<any>;
    @ViewChild('tagsPanelOrigin') private _tagsPanelOrigin: ElementRef;

    private _router = inject(Router);
    private _overlay = inject(Overlay);
    private _renderer2 = inject(Renderer2);
    private _activatedRoute = inject(ActivatedRoute);
    private _contactsService = inject(ContactsService);
    private _viewContainerRef = inject(ViewContainerRef);
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
        graduationYear: new FormControl<string | null>(''),
        company: new FormGroup({
            name: new FormControl<string | null>('', Validators.required),
            alternateName: new FormControl<string | null>(''),
            description: new FormControl<string | null>(''),
            website: new FormControl<string | null>(''),
            category: new FormControl<string | null>(''),
            primaryIndustry: new FormControl<string | null>(''),
            secondaryIndustry: new FormControl<string | null>(''),
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

    private _tagsPanelOverlayRef: OverlayRef;
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

        // Create the contact form
        // this.contactForm = this._formBuilder.group({
        //     id: [''],
        //     avatar: [null],
        //     name: ['', [Validators.required]],
        //     emails: this._formBuilder.array([]),
        //     phoneNumbers: this._formBuilder.array([]),
        //     title: [''],
        //     company: [''],
        //     birthday: [null],
        //     address: [null],
        //     notes: [null],
        //     tags: [[]],
        // });

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
                // this.contactForm.patchValue(contact);

                // Setup the emails form array
                // const emailFormGroups = [];

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

                // Add the email form groups to the emails form array
                // emailFormGroups.forEach((emailFormGroup) => {
                //     (this.contactForm.get('emails') as UntypedFormArray).push(
                //         emailFormGroup
                //     );
                // });

                // Setup the phone numbers form array
                const phoneNumbersFormGroups = [];

                // if (contact.phoneNumbers.length > 0) {
                //     // Iterate through them
                //     contact.phoneNumbers.forEach((phoneNumber) => {
                //         // Create an email form group
                //         phoneNumbersFormGroups.push(
                //             this._formBuilder.group({
                //                 country: [phoneNumber.country],
                //                 phoneNumber: [phoneNumber.phoneNumber],
                //                 label: [phoneNumber.label],
                //             })
                //         );
                //     });
                // } else {
                //     // Create a phone number form group
                //     phoneNumbersFormGroups.push(
                //         this._formBuilder.group({
                //             country: ['us'],
                //             phoneNumber: [''],
                //             label: [''],
                //         })
                //     );
                // }

                // Add the phone numbers form groups to the phone numbers form array
                // phoneNumbersFormGroups.forEach((phoneNumbersFormGroup) => {
                //     (
                //         this.contactForm.get('phoneNumbers') as UntypedFormArray
                //     ).push(phoneNumbersFormGroup);
                // });

                // Toggle the edit mode off
                this.toggleEditMode(false);

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        // Get the country telephone codes
        this._contactsService.countries$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((codes: Country[]) => {
                this.countries = codes;

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        // Get the tags
        // this._contactsService.tags$
        //     .pipe(takeUntil(this._unsubscribeAll))
        //     .subscribe((tags: Tag[]) => {
        //         this.tags = tags;
        //         this.filteredTags = tags;

        //         // Mark for check
        //         this._changeDetectorRef.markForCheck();
        //     });
    }

    /**
     * On destroy
     */
    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();

        // Dispose the overlays if they are still on the DOM
        if (this._tagsPanelOverlayRef) {
            this._tagsPanelOverlayRef.dispose();
        }
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
     * Open tags panel
     */
    openTagsPanel(): void {
        // Create the overlay
        this._tagsPanelOverlayRef = this._overlay.create({
            backdropClass: '',
            hasBackdrop: true,
            scrollStrategy: this._overlay.scrollStrategies.block(),
            positionStrategy: this._overlay
                .position()
                .flexibleConnectedTo(this._tagsPanelOrigin.nativeElement)
                .withFlexibleDimensions(true)
                .withViewportMargin(64)
                .withLockedPosition(true)
                .withPositions([
                    {
                        originX: 'start',
                        originY: 'bottom',
                        overlayX: 'start',
                        overlayY: 'top',
                    },
                ]),
        });

        // Subscribe to the attachments observable
        this._tagsPanelOverlayRef.attachments().subscribe(() => {
            // Add a class to the origin
            this._renderer2.addClass(
                this._tagsPanelOrigin.nativeElement,
                'panel-opened'
            );

            // Focus to the search input once the overlay has been attached
            this._tagsPanelOverlayRef.overlayElement
                .querySelector('input')
                .focus();
        });

        // Create a portal from the template
        const templatePortal = new TemplatePortal(
            this._tagsPanel,
            this._viewContainerRef
        );

        // Attach the portal to the overlay
        this._tagsPanelOverlayRef.attach(templatePortal);

        // Subscribe to the backdrop click
        this._tagsPanelOverlayRef.backdropClick().subscribe(() => {
            // Remove the class from the origin
            this._renderer2.removeClass(
                this._tagsPanelOrigin.nativeElement,
                'panel-opened'
            );

            // If overlay exists and attached...
            if (
                this._tagsPanelOverlayRef &&
                this._tagsPanelOverlayRef.hasAttached()
            ) {
                // Detach it
                this._tagsPanelOverlayRef.detach();

                // Reset the tag filter
                // this.filteredTags = this.tags;

                // Toggle the edit mode off
                this.tagsEditMode = false;
            }

            // If template portal exists and attached...
            if (templatePortal && templatePortal.isAttached) {
                // Detach it
                templatePortal.detach();
            }
        });
    }

    /**
     * Toggle the tags edit mode
     */
    toggleTagsEditMode(): void {
        this.tagsEditMode = !this.tagsEditMode;
    }

    /**
     * Filter tags
     *
     * @param event
     */
    filterTags(event): void {
        // Get the value
        const value = event.target.value.toLowerCase();

        // Filter the tags
        // this.filteredTags = this.tags.filter((tag) =>
        //     tag.title.toLowerCase().includes(value)
        // );
    }

    /**
     * Filter tags input key down event
     *
     * @param event
     */
    filterTagsInputKeyDown(event): void {
        // Return if the pressed key is not 'Enter'
        if (event.key !== 'Enter') {
            return;
        }

        // If there is no tag available...
        // if (this.filteredTags.length === 0) {
        //     // Create the tag
        //     this.createTag(event.target.value);

        //     // Clear the input
        //     event.target.value = '';

        //     // Return
        //     return;
        // }

        // If there is a tag...
        // const tag = this.filteredTags[0];
        // const isTagApplied = this.contact.tags.find((id) => id === tag.id);

        // // If the found tag is already applied to the contact...
        // if (isTagApplied) {
        //     // Remove the tag from the contact
        //     this.removeTagFromContact(tag);
        // } else {
        //     // Otherwise add the tag to the contact
        //     this.addTagToContact(tag);
        // }
    }

    /**
     * Create a new tag
     *
     * @param title
     */
    createTag(title: string): void {
        const tag = {
            title,
        };

        // Create tag on the server
        // this._contactsService.createTag(tag).subscribe((response) => {
        //     // Add the tag to the contact
        //     this.addTagToContact(response);
        // });
    }

    /**
     * Update the tag title
     *
     * @param tag
     * @param event
     */
    // updateTagTitle(tag: Tag, event): void {
    //     // Update the title on the tag
    //     tag.title = event.target.value;

    //     // Update the tag on the server
    //     this._contactsService
    //         .updateTag(tag.id, tag)
    //         .pipe(debounceTime(300))
    //         .subscribe();

    //     // Mark for check
    //     this._changeDetectorRef.markForCheck();
    // }

    /**
     * Delete the tag
     *
     * @param tag
     */
    // deleteTag(tag: Tag): void {
    //     // Delete the tag from the server
    //     this._contactsService.deleteTag(tag.id).subscribe();

    //     // Mark for check
    //     this._changeDetectorRef.markForCheck();
    // }

    /**
     * Add tag to the contact
     *
     * @param tag
     */
    // addTagToContact(tag: Tag): void {
    //     // Add the tag
    //     this.contact.tags.unshift(tag.id);

    //     // Update the contact form
    //     this.contactForm.get('tags').patchValue(this.contact.tags);

    //     // Mark for check
    //     this._changeDetectorRef.markForCheck();
    // }

    /**
     * Remove tag from the contact
     *
     * @param tag
     */
    // removeTagFromContact(tag: Tag): void {
    //     // Remove the tag
    //     this.contact.tags.splice(
    //         this.contact.tags.findIndex((item) => item === tag.id),
    //         1
    //     );

    //     // Update the contact form
    //     this.contactForm.get('tags').patchValue(this.contact.tags);

    //     // Mark for check
    //     this._changeDetectorRef.markForCheck();
    // }

    /**
     * Toggle contact tag
     *
     * @param tag
     */
    // toggleContactTag(tag: Tag): void {
    //     if (this.contact.tags.includes(tag.id)) {
    //         this.removeTagFromContact(tag);
    //     } else {
    //         this.addTagToContact(tag);
    //     }
    // }

    /**
     * Should the create tag button be visible
     *
     * @param inputValue
     */
    // shouldShowCreateTagButton(inputValue: string): boolean {
    //     return !!!(
    //         inputValue === '' ||
    //         this.tags.findIndex(
    //             (tag) => tag.title.toLowerCase() === inputValue.toLowerCase()
    //         ) > -1
    //     );
    // }

    /**
     * Add the email field
     */
    addEmailField(): void {
        // Create an empty email form group
        // const emailFormGroup = this._formBuilder.group({
        //     email: [''],
        //     label: [''],
        // });
        // // Add the email form group to the emails form array
        // (this.contactForm.get('emails') as UntypedFormArray).push(
        //     emailFormGroup
        // );
        // // Mark for check
        // this._changeDetectorRef.markForCheck();
    }

    /**
     * Remove the email field
     *
     * @param index
     */
    removeEmailField(index: number): void {
        // Get form array for emails
        // const emailsFormArray = this.contactForm.get(
        //     'emails'
        // ) as UntypedFormArray;
        // // Remove the email field
        // emailsFormArray.removeAt(index);
        // // Mark for check
        // this._changeDetectorRef.markForCheck();
    }

    /**
     * Add an empty phone number field
     */
    addPhoneNumberField(): void {
        // Create an empty phone number form group
        // const phoneNumberFormGroup = this._formBuilder.group({
        //     country: ['us'],
        //     phoneNumber: [''],
        //     label: [''],
        // });
        // // Add the phone number form group to the phoneNumbers form array
        // (this.contactForm.get('phoneNumbers') as UntypedFormArray).push(
        //     phoneNumberFormGroup
        // );
        // // Mark for check
        // this._changeDetectorRef.markForCheck();
    }

    /**
     * Remove the phone number field
     *
     * @param index
     */
    removePhoneNumberField(index: number): void {
        // Get form array for phone numbers
        // const phoneNumbersFormArray = this.contactForm.get(
        //     'phoneNumbers'
        // ) as UntypedFormArray;
        // // Remove the phone number field
        // phoneNumbersFormArray.removeAt(index);
        // // Mark for check
        // this._changeDetectorRef.markForCheck();
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
