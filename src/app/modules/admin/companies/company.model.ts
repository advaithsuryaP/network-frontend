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
