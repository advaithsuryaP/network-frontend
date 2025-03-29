import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
    selector: 'app-contacts',
    standalone: true,
    imports: [RouterOutlet],
    templateUrl: './contacts.component.html',
})
export class ContactsComponent {}
