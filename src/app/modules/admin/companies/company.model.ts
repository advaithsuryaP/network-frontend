export interface Company {
    id: string;
    name: string;
    category: string;
    primaryIndustry: string;

    // Optional fields
    description?: string;
    website?: string;
    attractedOutOfState?: boolean;
    confidentialityRequested?: boolean;
    intellectualProperty?: string;
    departmentIfFaculty?: string;
    usmFounders?: string;
    miscResources?: string;
    preCompanyResources?: string;
    preCompanyFunding?: number;
    icorps?: boolean;
    tcf?: boolean;
    contacts?: string[]; // property via association
}
