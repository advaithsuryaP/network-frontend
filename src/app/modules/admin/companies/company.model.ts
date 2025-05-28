export interface Company {
    id: string;
    name: string;
    category: string;
    primaryIndustry: string;

    // Optional fields
    description?: string;
    website?: string;
    intellectualProperty?: string;
    fundingReceived?: number;
    contacts?: string[]; // property via association
}
