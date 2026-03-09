import { useState, useCallback, useEffect } from 'react';
import { Contact, ContactFormData, ContactFilters, SortOption, ContactGroup } from '@/types/contact';

const STORAGE_KEY = 'contacts-manager-data';

/** Sample contacts for initial load */
const SAMPLE_CONTACTS: Contact[] = [
  {
    id: '1', name: 'Alice Johnson', phone: '5551234567', email: 'alice@example.com',
    address: '123 Maple St, Springfield', group: 'Friends', isFavorite: true,
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(), updatedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
  {
    id: '2', name: 'Bob Williams', phone: '5559876543', email: 'bob@work.com',
    address: '456 Oak Ave, Shelbyville', group: 'Work', isFavorite: false,
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(), updatedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
  {
    id: '3', name: 'Carol Smith', phone: '5555551234', email: 'carol@family.org',
    address: '789 Pine Rd, Capital City', group: 'Family', isFavorite: true,
    createdAt: new Date(Date.now() - 86400000 * 1).toISOString(), updatedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
  },
  {
    id: '4', name: 'David Lee', phone: '5552223333', email: 'david.lee@example.com',
    address: '321 Elm Blvd, Ogdenville', group: 'Friends', isFavorite: false,
    createdAt: new Date(Date.now() - 86400000 * 10).toISOString(), updatedAt: new Date(Date.now() - 86400000 * 10).toISOString(),
  },
  {
    id: '5', name: 'Eva Martinez', phone: '5558889999', email: 'eva@work.com',
    address: '654 Birch Ln, North Haverbrook', group: 'Work', isFavorite: false,
    createdAt: new Date(Date.now() - 86400000 * 7).toISOString(), updatedAt: new Date(Date.now() - 86400000 * 7).toISOString(),
  },
];

/** Load contacts from localStorage */
function loadContacts(): Contact[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) return JSON.parse(data);
  } catch {
    // Ignore parse errors
  }
  // First load: use sample data
  localStorage.setItem(STORAGE_KEY, JSON.stringify(SAMPLE_CONTACTS));
  return SAMPLE_CONTACTS;
}

/** Save contacts to localStorage */
function saveContacts(contacts: Contact[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(contacts));
}

/** Sort contacts by the given option */
function sortContacts(contacts: Contact[], sort: SortOption): Contact[] {
  return [...contacts].sort((a, b) => {
    switch (sort) {
      case 'name-asc': return a.name.localeCompare(b.name);
      case 'name-desc': return b.name.localeCompare(a.name);
      case 'recent': return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case 'oldest': return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      default: return 0;
    }
  });
}

/** Filter contacts based on search, group, and favorites */
function filterContacts(contacts: Contact[], filters: ContactFilters): Contact[] {
  let result = contacts;
  if (filters.search) {
    const q = filters.search.toLowerCase();
    result = result.filter(c => c.name.toLowerCase().includes(q) || c.phone.includes(q));
  }
  if (filters.group !== 'All') {
    result = result.filter(c => c.group === filters.group);
  }
  if (filters.favoritesOnly) {
    result = result.filter(c => c.isFavorite);
  }
  return sortContacts(result, filters.sort);
}

/** Custom hook that manages all contact CRUD operations with localStorage persistence */
export function useContacts() {
  const [contacts, setContacts] = useState<Contact[]>(loadContacts);
  const [filters, setFilters] = useState<ContactFilters>({
    search: '', group: 'All', favoritesOnly: false, sort: 'name-asc',
  });

  // Persist on every change
  useEffect(() => { saveContacts(contacts); }, [contacts]);

  const filteredContacts = filterContacts(contacts, filters);

  /** Add a new contact, returns error string if duplicate phone */
  const addContact = useCallback((data: ContactFormData): string | null => {
    if (contacts.some(c => c.phone === data.phone)) {
      return 'A contact with this phone number already exists.';
    }
    const now = new Date().toISOString();
    const newContact: Contact = { ...data, id: crypto.randomUUID(), createdAt: now, updatedAt: now };
    setContacts(prev => [...prev, newContact]);
    return null;
  }, [contacts]);

  /** Update an existing contact by ID */
  const updateContact = useCallback((id: string, data: ContactFormData): string | null => {
    if (contacts.some(c => c.phone === data.phone && c.id !== id)) {
      return 'A contact with this phone number already exists.';
    }
    setContacts(prev => prev.map(c =>
      c.id === id ? { ...c, ...data, updatedAt: new Date().toISOString() } : c
    ));
    return null;
  }, [contacts]);

  /** Delete a contact by ID */
  const deleteContact = useCallback((id: string) => {
    setContacts(prev => prev.filter(c => c.id !== id));
  }, []);

  /** Toggle favorite status */
  const toggleFavorite = useCallback((id: string) => {
    setContacts(prev => prev.map(c =>
      c.id === id ? { ...c, isFavorite: !c.isFavorite, updatedAt: new Date().toISOString() } : c
    ));
  }, []);

  /** Export all contacts to CSV and trigger download */
  const exportCSV = useCallback(() => {
    const headers = ['Name', 'Phone', 'Email', 'Address', 'Group', 'Favorite'];
    const rows = contacts.map(c => [c.name, c.phone, c.email, c.address, c.group, c.isFavorite ? 'Yes' : 'No']);
    const csv = [headers, ...rows].map(r => r.map(v => `"${v.replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'contacts.csv';
    a.click();
    URL.revokeObjectURL(url);
  }, [contacts]);

  /** Import contacts from a CSV file */
  const importCSV = useCallback((file: File): Promise<{ added: number; skipped: number }> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        const lines = text.split('\n').filter(l => l.trim());
        if (lines.length < 2) { resolve({ added: 0, skipped: 0 }); return; }

        let added = 0, skipped = 0;
        const newContacts: Contact[] = [...contacts];
        const existingPhones = new Set(contacts.map(c => c.phone));

        for (let i = 1; i < lines.length; i++) {
          // Simple CSV parse (handles quoted fields)
          const fields = lines[i].match(/(".*?"|[^",]+)(?=\s*,|\s*$)/g)?.map(f => f.replace(/^"|"$/g, '').replace(/""/g, '"')) || [];
          if (fields.length < 4) { skipped++; continue; }
          const [name, phone, email, address] = fields;
          const group = (fields[4] as ContactGroup) || 'Other';
          const isFavorite = fields[5]?.toLowerCase() === 'yes';

          if (!name || !phone || existingPhones.has(phone)) { skipped++; continue; }

          const now = new Date().toISOString();
          newContacts.push({ id: crypto.randomUUID(), name, phone, email: email || '', address: address || '', group, isFavorite, createdAt: now, updatedAt: now });
          existingPhones.add(phone);
          added++;
        }
        setContacts(newContacts);
        resolve({ added, skipped });
      };
      reader.readAsText(file);
    });
  }, [contacts]);

  /** Get the 5 most recently added contacts */
  const recentContacts = sortContacts(contacts, 'recent').slice(0, 5);

  return {
    contacts, filteredContacts, filters, setFilters, recentContacts,
    addContact, updateContact, deleteContact, toggleFavorite,
    exportCSV, importCSV, totalCount: contacts.length,
  };
}
