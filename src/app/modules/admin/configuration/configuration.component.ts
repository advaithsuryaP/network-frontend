import { NgFor } from '@angular/common';
import { NgClass } from '@angular/common';
import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    inject,
    OnDestroy,
    OnInit,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDrawer, MatSidenavModule } from '@angular/material/sidenav';
import { FuseMediaWatcherService } from '@fuse/services/media-watcher';
import { Subject, takeUntil } from 'rxjs';
import { ConfigurationCategoryType } from './configuration.enum';
import { ConfigurationCategoryEnum } from './configuration.enum';
import { Router, RouterOutlet } from '@angular/router';

interface ConfigurationPanel {
    id: ConfigurationCategoryEnum;
    icon: string;
    title: string;
    description: string;
    route: string;
}

@Component({
    selector: 'app-configuration',
    standalone: true,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [NgFor, NgClass, RouterOutlet, MatIconModule, MatButtonModule, MatSidenavModule],
    templateUrl: './configuration.component.html'
})
export class ConfigurationComponent implements OnInit, OnDestroy {
    @ViewChild('drawer') drawer: MatDrawer;

    private _router = inject(Router);

    drawerMode: 'over' | 'side' = 'side';
    drawerOpened: boolean = true;
    panels: ConfigurationPanel[] = [
        {
            id: ConfigurationCategoryEnum.LABELS,
            icon: 'heroicons_outline:tag',
            title: 'Contact Labels',
            description: 'Manage the labels for the emails and phone numbers of your contacts',
            route: 'contact-labels'
        },
        {
            id: ConfigurationCategoryEnum.COMPANY_CATEGORY,
            icon: 'heroicons_outline:user-circle',
            title: 'Company Categories',
            description: 'Manage the company categories for the companies in your network',
            route: 'company-categories'
        },
        {
            id: ConfigurationCategoryEnum.PRIMARY_INDUSTRY,
            icon: 'heroicons_outline:lock-closed',
            title: 'Primary Industries',
            description: 'Manage the primary industry labels for the companies in your network',
            route: 'primary-industries'
        },
        {
            id: ConfigurationCategoryEnum.UNIVERSITY,
            icon: 'heroicons_outline:building-office-2',
            title: 'Network Universities',
            description: 'Manage the universities in your network',
            route: 'network-universities'
        }
    ];
    selectedPanel: ConfigurationCategoryType = ConfigurationCategoryEnum.LABELS;

    ConfigurationCategoryEnum = ConfigurationCategoryEnum;
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    /**
     * Constructor
     */
    constructor(
        private _changeDetectorRef: ChangeDetectorRef,
        private _fuseMediaWatcherService: FuseMediaWatcherService
    ) {}

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void {
        // Subscribe to media changes
        this._fuseMediaWatcherService.onMediaChange$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(({ matchingAliases }) => {
                // Set the drawerMode and drawerOpened
                if (matchingAliases.includes('lg')) {
                    this.drawerMode = 'side';
                    this.drawerOpened = true;
                } else {
                    this.drawerMode = 'over';
                    this.drawerOpened = false;
                }

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
     * Navigate to the panel
     *
     * @param panel
     */
    goToPanel(panel: ConfigurationPanel): void {
        this.selectedPanel = panel.id;
        this._router.navigate(['/configuration', panel.route]);

        // Close the drawer on 'over' mode
        if (this.drawerMode === 'over') {
            this.drawer.close();
        }
    }

    /**
     * Get the details of the panel
     *
     * @param id
     */
    getPanelInfo(id: string): any {
        return this.panels.find(panel => panel.id === id);
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
