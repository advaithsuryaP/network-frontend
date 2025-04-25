import { Company } from '../companies/company.model';
import { Contact } from './contact.model';

export type CreateContactPayload = Omit<Contact, 'id' | 'createdAt' | 'updatedAt'> & {
    company: Omit<Company, 'id' | 'createdAt' | 'updatedAt'>;
};
