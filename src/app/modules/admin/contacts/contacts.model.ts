export interface Contact {
    id?: string;
    avatar?: string | null;
    firstName: string;
    lastName: string;
    email?: string;
    phone?: string;
    notes?: string;
    roleInCompany: string;
    major?: string;
    graduationYear?: number;
    companyId: string;
    company?: Company; // optional for JOIN responses
}

export interface Company {
    id?: string;
    name: string;
    alternateName?: string;
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
