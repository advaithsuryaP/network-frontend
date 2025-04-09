import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
    selector: 'app-companies',
    standalone: true,
    imports: [RouterOutlet],
    templateUrl: './companies.component.html'
})
export class CompaniesComponent {}
