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
    preCompanyFunding?: number;
    icorps?: boolean;
    tcf?: boolean;
    tcfAmount?: number;
    contacts?: string[]; // property via association
}
