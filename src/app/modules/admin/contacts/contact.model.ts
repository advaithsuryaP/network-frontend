import { Company } from '../companies/company.model';

export interface Contact {
    id?: string;
    avatar?: string | null;
    background?: string | null;
    firstName: string;
    lastName: string;
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
    title: string;
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

export interface Category {
    id: string;
    label: string;
}
