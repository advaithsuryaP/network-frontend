import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ElementRef,
    inject,
    OnDestroy,
    OnInit,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import { NgClass, NgFor, NgIf } from '@angular/common';
import { Subject, switchMap, takeUntil, combineLatest, tap } from 'rxjs';
import { ContactsService } from '../../contacts.service';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Contact, Country } from '../../contact.model';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { FormArray, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatRippleModule } from '@angular/material/core';
import { MatRadioModule } from '@angular/material/radio';
import { Configuration } from '../../../configuration/configuration.model';
import { ConfigurationService } from '../../../configuration/configuration.service';
import { ConfigurationCategoryEnum } from '../../../configuration/configuration.enum';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
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
    university: FormControl<string | null>;
    major: FormControl<string | null>;
    company: FormGroup<{
        id: FormControl<string | null>;
        name: FormControl<string | null>;
        description: FormControl<string | null>;
        website: FormControl<string | null>;
        category: FormControl<string>;
        primaryIndustry: FormControl<string>;
        attractedOutOfState: FormControl<boolean | null>;
        confidentialityRequested: FormControl<boolean | null>;
        intellectualProperty: FormControl<string | null>;
        departmentIfFaculty: FormControl<string | null>;
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
    selector: 'app-contact-edit',
    standalone: true,
    imports: [
        NgIf,
        NgFor,
        NgClass,
        RouterLink,
        MatIconModule,
        MatInputModule,
        MatRadioModule,
        MatSelectModule,
        MatButtonModule,
        MatRippleModule,
        MatTooltipModule,
        MatFormFieldModule,
        ReactiveFormsModule,
        MatSlideToggleModule
    ],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './contact-edit.component.html'
})
export class ContactEditComponent implements OnInit, OnDestroy {
    @ViewChild('avatarFileInput') private _avatarFileInput: ElementRef;

    private _router = inject(Router);
    private _activatedRoute = inject(ActivatedRoute);
    private _contactsService = inject(ContactsService);
    private _changeDetectorRef = inject(ChangeDetectorRef);
    private _configurationService = inject(ConfigurationService);
    private _fuseConfirmationService = inject(FuseConfirmationService);

    editMode: boolean = false;
    private _unsubscribeAll: Subject<void> = new Subject<void>();

    countries: Country[] = [];
    isEditMode: boolean = false;
    contact: Contact | null = null;

    // Configurations
    labels: Configuration[] = [];
    universities: Configuration[] = [];
    companyCategories: Configuration[] = [];
    primaryIndustries: Configuration[] = [];

    contactForm = new FormGroup<ContactForm>({
        id: new FormControl<string>(''),
        major: new FormControl<string | null>(''),
        notes: new FormControl<string | null>(''),
        avatar: new FormControl<string | null>(null),
        emails: new FormArray<FormGroup<EmailFormGroup>>([]),
        phoneNumbers: new FormArray<FormGroup<PhoneNumberFormGroup>>([]),
        firstName: new FormControl<string>('', { nonNullable: true, validators: [Validators.required] }),
        lastName: new FormControl<string>('', { nonNullable: true, validators: [Validators.required] }),
        university: new FormControl<string>('', { nonNullable: true, validators: [Validators.required] }),
        title: new FormControl<string>('', { nonNullable: true, validators: [Validators.required] }),
        company: new FormGroup({
            id: new FormControl<string | null>(''),
            name: new FormControl<string | null>('', { nonNullable: true, validators: [Validators.required] }),
            description: new FormControl<string | null>(''),
            website: new FormControl<string | null>(''),
            category: new FormControl<string>('', {
                nonNullable: true,
                validators: [Validators.required]
            }),
            primaryIndustry: new FormControl<string>('', {
                nonNullable: true,
                validators: [Validators.required]
            }),
            attractedOutOfState: new FormControl<boolean | null>(false, { nonNullable: true }),
            confidentialityRequested: new FormControl<boolean | null>(false, { nonNullable: true }),
            intellectualProperty: new FormControl<string | null>(''),
            departmentIfFaculty: new FormControl<string | null>(''),
            usmFounders: new FormControl<string | null>(''),
            miscResources: new FormControl<string | null>(''),
            preCompanyResources: new FormControl<string | null>(''),
            preCompanyFunding: new FormControl<number | null>(null),
            icorps: new FormControl<boolean | null>(false, { nonNullable: true }),
            tcf: new FormControl<boolean | null>(false, { nonNullable: true }),
            tcfAmount: new FormControl<number | null>(null),
            comments: new FormControl<string | null>('')
        })
    });

    ngOnInit(): void {
        // Get the contact
        const contact$ = this._contactsService.contact$;

        const countries$ = this._contactsService.countries$.pipe(
            tap((countries: Country[]) => (this.countries = countries))
        );

        const configurations$ = this._configurationService.configurations$.pipe(
            tap((configurations: Configuration[]) => {
                this.labels = configurations.filter(config => config.category === ConfigurationCategoryEnum.LABELS);
                this.companyCategories = configurations.filter(
                    config => config.category === ConfigurationCategoryEnum.COMPANY_CATEGORY
                );
                this.primaryIndustries = configurations.filter(
                    config => config.category === ConfigurationCategoryEnum.PRIMARY_INDUSTRY
                );
                this.universities = configurations.filter(
                    config => config.category === ConfigurationCategoryEnum.UNIVERSITY
                );
            })
        );

        const newContact$ = combineLatest([countries$, configurations$]).pipe(
            tap(_ => {
                this.addEmailField();
                this.addPhoneNumberField();

                // Patch the university and isFromUniversity values
                this.contactForm.patchValue({
                    university: this.universities[0].id
                });

                // Patch the default values for company category and primary industry
                this.contactForm.controls.company.patchValue({
                    category: this.companyCategories[0].id,
                    primaryIndustry: this.primaryIndustries[0].id
                });
            })
        );

        const editContact$ = combineLatest([contact$, countries$, configurations$]).pipe(
            tap(([contact, _, ___]) => {
                this.contact = contact;

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
                    university: contact.university
                });

                // Only patch company values if contact has a company
                if (contact.company) {
                    this.contactForm.controls.company.patchValue({
                        id: contact.company.id,
                        name: contact.company.name,
                        description: contact.company.description,
                        website: contact.company.website,
                        category: contact.company.category,
                        primaryIndustry: contact.company.primaryIndustry,
                        attractedOutOfState: contact.company.attractedOutOfState,
                        confidentialityRequested: contact.company.confidentialityRequested,
                        intellectualProperty: contact.company.intellectualProperty,
                        departmentIfFaculty: contact.company.departmentIfFaculty,
                        usmFounders: contact.company.usmFounders,
                        miscResources: contact.company.miscResources,
                        preCompanyResources: contact.company.preCompanyResources,
                        preCompanyFunding: contact.company.preCompanyFunding,
                        icorps: contact.company.icorps,
                        tcf: contact.company.tcf,
                        tcfAmount: contact.company.tcfAmount,
                        comments: contact.company.comments
                    });
                }

                if (contact.emails.length > 0) {
                    contact.emails.forEach(email => {
                        this.contactForm.controls.emails.push(
                            new FormGroup<EmailFormGroup>({
                                label: new FormControl<string>(email.label, {
                                    validators: [Validators.required],
                                    nonNullable: true
                                }),
                                email: new FormControl<string>(email.email, {
                                    validators: [Validators.required, Validators.email],
                                    nonNullable: true
                                })
                            })
                        );
                    });
                }

                if (contact.phoneNumbers.length > 0) {
                    contact.phoneNumbers.forEach(phoneNumber => {
                        this.contactForm.controls.phoneNumbers.push(
                            new FormGroup<PhoneNumberFormGroup>({
                                countryCode: new FormControl<string>(phoneNumber.countryCode, {
                                    validators: [Validators.required],
                                    nonNullable: true
                                }),
                                phoneNumber: new FormControl<string>(phoneNumber.phoneNumber, {
                                    validators: [Validators.required, Validators.pattern(/^\d{10}$/)],
                                    nonNullable: true
                                }),
                                label: new FormControl<string>(phoneNumber.label, {
                                    validators: [Validators.required],
                                    nonNullable: true
                                })
                            })
                        );
                    });
                }
            })
        );

        // Subscribe to the paramMap to determine if we're editing or creating
        this._activatedRoute.paramMap
            .pipe(
                switchMap(paramMap => {
                    this.isEditMode = paramMap.has('id');
                    return this.isEditMode ? editContact$ : newContact$;
                }),
                takeUntil(this._unsubscribeAll)
            )
            .subscribe({
                next: () => this._changeDetectorRef.markForCheck()
            });
    }

    saveContact(): void {
        const payload = this.contactForm.getRawValue();

        // Only include company data if it has been modified and has values
        if (!payload.company.id && !payload.company.name) {
            delete payload.company;
        }

        if (this.isEditMode) {
            // Update the contact on the server
            this._contactsService.updateContact(payload.id, payload).subscribe(() => {
                this._router.navigate(['/contacts', 'view', payload.id]);
            });
        } else {
            // Create new contact
            this._contactsService.createContact(payload).subscribe(newContact => {
                this._router.navigate(['/contacts', 'view', newContact.id]);
            });
        }
    }

    cancel(): void {
        if (this.isEditMode) {
            this._router.navigate(['/contacts', 'view', this.contact.id]);
        } else {
            this._router.navigate(['/contacts']);
        }
    }

    addEmailField(): void {
        this.contactForm.controls.emails.push(
            new FormGroup<EmailFormGroup>({
                label: new FormControl<string>(this.labels[0].id, {
                    validators: [Validators.required],
                    nonNullable: true
                }),
                email: new FormControl<string>('', {
                    validators: [Validators.required, Validators.email],
                    nonNullable: true
                })
            })
        );
        this._changeDetectorRef.markForCheck();
    }

    removeEmailField(index: number): void {
        this.contactForm.controls.emails.removeAt(index);
        this._changeDetectorRef.markForCheck();
    }

    addPhoneNumberField(): void {
        this.contactForm.controls.phoneNumbers.push(
            new FormGroup<PhoneNumberFormGroup>({
                countryCode: new FormControl<string>('us', {
                    validators: [Validators.required],
                    nonNullable: true
                }),
                phoneNumber: new FormControl<string>('', {
                    validators: [Validators.required, Validators.pattern(/^\d{10}$/)],
                    nonNullable: true
                }),
                label: new FormControl<string>(this.labels[0].id, {
                    validators: [Validators.required],
                    nonNullable: true
                })
            })
        );
        this._changeDetectorRef.markForCheck();
    }

    removePhoneNumberField(index: number): void {
        this.contactForm.controls.phoneNumbers.removeAt(index);
        this._changeDetectorRef.markForCheck();
    }

    getCountryByIso(iso: string): Country {
        return this.countries.find(country => country.iso === iso);
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
     * Delete the contact
     */
    deleteContact(): void {
        // Open the confirmation dialog
        const confirmation = this._fuseConfirmationService.open({
            title: 'Delete contact',
            message: 'Are you sure you want to delete this contact? This action cannot be undone!',
            actions: {
                confirm: {
                    label: 'Delete'
                }
            }
        });

        // Subscribe to the confirmation dialog closed action
        confirmation.afterClosed().subscribe(result => {
            // If the confirm button pressed...
            if (result === 'confirmed') {
                // Get the current contact's id
                const id = this.contact.id;

                // Delete the contact
                this._contactsService.deleteContact(id).subscribe(isDeleted => {
                    // Return if the contact wasn't deleted...
                    if (!isDeleted) {
                        return;
                    }

                    // Otherwise, navigate to the parent
                    else {
                        this._router.navigate(['/contacts'], {
                            relativeTo: this._activatedRoute
                        });
                    }
                });

                // Mark for check
                this._changeDetectorRef.markForCheck();
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

    ngOnDestroy(): void {
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }
}
