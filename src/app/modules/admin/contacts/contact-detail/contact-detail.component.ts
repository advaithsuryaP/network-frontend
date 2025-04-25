import { ChangeDetectionStrategy, Component, inject, OnInit, ViewEncapsulation } from '@angular/core';
import { ContactListComponent } from '../contact-list/contact-list.component';
import { RouterOutlet } from '@angular/router';
import { MatDrawerToggleResult } from '@angular/material/sidenav';

@Component({
    selector: 'app-contact-detail',
    standalone: true,
    imports: [RouterOutlet],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './contact-detail.component.html'
})
export class ContactDetailComponent implements OnInit {
    private _contactsListComponent = inject(ContactListComponent);

    ngOnInit(): void {
        // Open the drawer
        this._contactsListComponent.matDrawer.open();
    }

    /**
     * Close the drawer
     */
    closeDrawer(): Promise<MatDrawerToggleResult> {
        return this._contactsListComponent.matDrawer.close();
    }
}
