import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
    selector: 'app-startups',
    standalone: true,
    imports: [RouterOutlet],
    templateUrl: './startups.component.html'
})
export class StartupsComponent {}
