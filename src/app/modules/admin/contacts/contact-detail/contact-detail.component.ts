import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    inject,
    OnInit,
    ViewEncapsulation
} from '@angular/core';
import { NgIf } from '@angular/common';
import { ContactListComponent } from '../contact-list/contact-list.component';
import { ActivatedRoute } from '@angular/router';
import { MatDrawerToggleResult } from '@angular/material/sidenav';
import { ContactPreviewComponent } from './contact-preview/contact-preview.component';
import { ContactEditComponent } from './contact-edit/contact-edit.component';

@Component({
    selector: 'app-contact-detail',
    standalone: true,
    imports: [NgIf, ContactPreviewComponent, ContactEditComponent],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './contact-detail.component.html'
})
export class ContactDetailComponent implements OnInit {
    private _activatedRoute = inject(ActivatedRoute);
    private _changeDetectorRef = inject(ChangeDetectorRef);
    private _contactsListComponent = inject(ContactListComponent);

    editMode: boolean = false;

    ngOnInit(): void {
        // Open the drawer
        this._contactsListComponent.matDrawer.open();

        this._activatedRoute.url.subscribe(url => {
            const latestUrl = url[url.length - 1];
            if (latestUrl.path === 'edit') {
                this.editMode = true;
            } else if (latestUrl.path === 'view') {
                this.editMode = false;
            }
        });
    }

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
}
