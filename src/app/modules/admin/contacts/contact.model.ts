import { Company } from '../companies/company.model';

export interface Contact {
    id?: string;
    avatar?: string | null;
    background?: string | null;
    title: string;
    firstName: string;
    lastName: string;
    university: string;
    emails: Array<{
        label: string;
        email: string;
    }>;
    phoneNumbers: Array<{
        label: string;
        countryCode: string;
        phoneNumber: string;
    }>;
    notes?: string;
    major?: string;
    company?: Company;
}

export interface Country {
    id: string;
    iso: string;
    name: string;
    code: string;
    flagImagePos: string;
}
