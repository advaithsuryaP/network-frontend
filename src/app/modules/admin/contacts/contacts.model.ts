export interface Contact {
    id?: string;
    avatar?: string | null;
    background?: string | null;
    firstName: string;
    lastName: string;
    emails?: {
        label: string;
        email: string;
    }[];
    phoneNumbers?: {
        label: string;
        countryCode: string;
        phoneNumber: string;
    }[];
    notes?: string;
    title: string;
    major?: string;
    companyId: string;
    company?: Company; // optional for JOIN responses
}

export interface Company {
    id?: string;
    name: string;
    description?: string;
    website?: string;
    category?: string;
    primaryIndustry?: string;
    secondaryIndustry?: string;
    attractedOutOfState?: boolean;
    confidentialityRequested?: boolean;
    intellectualProperty?: string;
    departmentIfFaculty?: string;
    pointOfContactName?: string;
    pointOfContactEmail?: string;
    pointOfContactPhone?: string;
    usmFounders?: string;
    miscResources?: string;
    preCompanyResources?: string;
    preCompanyFunding?: number;
    icorps?: boolean;
    tcf?: boolean;
    tcfAmount?: number;
    comments?: string;
}

export interface Country {
    id: string;
    iso: string;
    name: string;
    code: string;
    flagImagePos: string;
}
