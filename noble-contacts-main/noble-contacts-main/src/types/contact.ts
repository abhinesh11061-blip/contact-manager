/** Represents a contact group category */
export type ContactGroup = 'Family' | 'Friends' | 'Work' | 'Other';

/** Main contact interface with all fields */
export interface Contact {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  group: ContactGroup;
  isFavorite: boolean;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}

/** Fields required to create a new contact */
export type ContactFormData = Omit<Contact, 'id' | 'createdAt' | 'updatedAt'>;

/** Available sort options */
export type SortOption = 'name-asc' | 'name-desc' | 'recent' | 'oldest';

/** Filter options for viewing contacts */
export interface ContactFilters {
  search: string;
  group: ContactGroup | 'All';
  favoritesOnly: boolean;
  sort: SortOption;
}
