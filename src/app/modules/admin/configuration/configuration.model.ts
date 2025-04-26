import { ConfigurationCategoryType } from './configuration.enum';

export interface Configuration {
    id: string;
    label: string;
    description?: string;
    is_hidden: boolean;
    is_disabled: boolean;
    category: ConfigurationCategoryType;
}
