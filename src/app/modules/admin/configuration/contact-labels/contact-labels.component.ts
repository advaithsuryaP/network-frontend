import { CommonModule } from '@angular/common';
import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    OnDestroy,
    OnInit,
    ViewEncapsulation
} from '@angular/core';
import { FormsModule, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { fuseAnimations } from '@fuse/animations';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { map, Observable, Subject, takeUntil } from 'rxjs';
import { ConfigurationService } from '../configuration.service';
import { Configuration } from '../configuration.model';
import { ConfigurationCategoryEnum } from '../configuration.enum';

@Component({
    selector: 'app-contact-labels',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        MatButtonModule,
        MatIconModule,
        MatTableModule,
        MatSlideToggleModule,
        MatFormFieldModule,
        MatInputModule
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './contact-labels.component.html',
    encapsulation: ViewEncapsulation.None,
    animations: fuseAnimations,
    styles: [
        `
            .labels-grid {
                grid-template-columns: 48px auto 40px;

                @screen sm {
                    grid-template-columns: 48px auto 112px 72px;
                }

                @screen md {
                    grid-template-columns: 48px 112px auto 112px 72px;
                }

                @screen lg {
                    grid-template-columns: 48px 112px auto 112px 96px 96px 72px;
                }
            }
        `
    ]
})
export default class ContactLabelsComponent implements OnInit, OnDestroy {
    configurations$: Observable<Configuration[]>;
    configurations: Configuration[];
    displayedColumns: string[] = ['label', 'description', 'is_hidden', 'is_disabled', 'details'];
    expandedConfiguration: Configuration | null = null;
    configurationForm: UntypedFormGroup;
    private _unsubscribeAll: Subject<void> = new Subject<void>();

    constructor(
        private _changeDetectorRef: ChangeDetectorRef,
        private _fuseConfirmationService: FuseConfirmationService,
        private _formBuilder: UntypedFormBuilder,
        private _configurationService: ConfigurationService
    ) {}

    ngOnInit(): void {
        // Create the configuration form
        this.configurationForm = this._formBuilder.group({
            id: [''],
            label: ['', [Validators.required]],
            category: [ConfigurationCategoryEnum.LABELS, [Validators.required]],
            description: [''],
            is_hidden: [false],
            is_disabled: [false]
        });

        // Get the configurations
        this.configurations$ = this._configurationService.configurations$.pipe(
            map(configurations => configurations.filter(config => config.category === ConfigurationCategoryEnum.LABELS))
        );

        // Subscribe to the configurations
        this.configurations$.pipe(takeUntil(this._unsubscribeAll)).subscribe((configurations: Configuration[]) => {
            this.configurations = configurations;
            this._changeDetectorRef.markForCheck();
        });
    }

    createConfiguration(): void {
        this._configurationService
            .createConfiguration(ConfigurationCategoryEnum.LABELS)
            .subscribe((newConfig: Configuration) => {
                // Automatically expand the new configuration for editing
                this.expandedConfiguration = newConfig;
                this.configurationForm.patchValue(newConfig);
                this._changeDetectorRef.markForCheck();
            });
    }

    toggleConfiguration(configuration: Configuration): void {
        if (this.expandedConfiguration?.id === configuration.id) {
            this.expandedConfiguration = null;
        } else {
            this.expandedConfiguration = configuration;
            this.configurationForm.patchValue(configuration);
        }
        this._changeDetectorRef.markForCheck();
    }

    updateConfiguration(): void {
        const configuration = this.configurationForm.getRawValue();
        this._configurationService.updateConfiguration(configuration).subscribe(() => {
            this.expandedConfiguration = null;
            this._changeDetectorRef.markForCheck();
        });
    }

    cancelUpdate(): void {
        this.expandedConfiguration = null;
        this._changeDetectorRef.markForCheck();
    }

    deleteConfiguration(configuration: Configuration): void {
        const confirmation = this._fuseConfirmationService.open({
            title: 'Delete configuration',
            message: 'Are you sure you want to delete this configuration? This action cannot be undone!',
            actions: {
                confirm: {
                    label: 'Delete'
                }
            }
        });

        confirmation.afterClosed().subscribe(result => {
            if (result === 'confirmed') {
                this._configurationService.deleteConfiguration(configuration.id).subscribe(() => {
                    this._changeDetectorRef.markForCheck();
                });
            }
        });
    }

    trackByFn(index: number, item: any): any {
        return item.id || index;
    }

    isExpandedRow = (row: any) => {
        return this.expandedConfiguration?.id === row.id;
    };

    ngOnDestroy(): void {
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }
}
