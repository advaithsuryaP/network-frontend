import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-contact-filter',
    standalone: true,
    imports: [CommonModule],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './contact-filter.component.html'
})
export class ContactFilterComponent {}
