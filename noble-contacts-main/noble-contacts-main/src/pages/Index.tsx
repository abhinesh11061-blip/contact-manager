import { useState, useCallback } from 'react';
import { useContacts } from '@/store/useContacts';
import { Contact } from '@/types/contact';
import { ContactToolbar } from '@/components/ContactToolbar';
import { ContactCard } from '@/components/ContactCard';
import { ContactForm } from '@/components/ContactForm';
import { RecentContacts } from '@/components/RecentContacts';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { Users } from 'lucide-react';

/** Main page: renders the full Contact Manager UI */
const Index = () => {
  const {
    filteredContacts, filters, setFilters, recentContacts, totalCount,
    addContact, updateContact, deleteContact, toggleFavorite, exportCSV, importCSV,
  } = useContacts();

  const [formOpen, setFormOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  /** Open form dialog for adding a new contact */
  const handleAdd = useCallback(() => { setEditingContact(null); setFormOpen(true); }, []);

  /** Open form dialog for editing an existing contact */
  const handleEdit = useCallback((c: Contact) => { setEditingContact(c); setFormOpen(true); }, []);

  /** Handle form submission for both add and edit */
  const handleSubmit = useCallback((data: Parameters<typeof addContact>[0]) => {
    const err = editingContact ? updateContact(editingContact.id, data) : addContact(data);
    if (err) return err;
    setFormOpen(false);
    toast.success(editingContact ? 'Contact updated' : 'Contact added');
    return null;
  }, [editingContact, addContact, updateContact]);

  /** Confirm deletion of a contact */
  const handleConfirmDelete = useCallback(() => {
    if (deletingId) { deleteContact(deletingId); toast.success('Contact deleted'); setDeletingId(null); }
  }, [deletingId, deleteContact]);

  /** Handle CSV import and show results */
  const handleImport = useCallback(async (file: File) => {
    const { added, skipped } = await importCSV(file);
    toast.success(`Imported ${added} contacts${skipped ? `, ${skipped} skipped` : ''}`);
  }, [importCSV]);

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Toolbar: search, filter, actions */}
        <ContactToolbar
          filters={filters}
          onFiltersChange={setFilters}
          totalCount={totalCount}
          filteredCount={filteredContacts.length}
          onAdd={handleAdd}
          onExport={exportCSV}
          onImport={handleImport}
        />

        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_280px]">
          {/* Contact grid */}
          <div>
            {filteredContacts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                <Users className="h-12 w-12 mb-4 opacity-40" />
                <p className="text-lg font-medium">No contacts found</p>
                <p className="text-sm">Try adjusting your filters or add a new contact.</p>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {filteredContacts.map(c => (
                  <ContactCard key={c.id} contact={c} onEdit={handleEdit} onDelete={setDeletingId} onToggleFavorite={toggleFavorite} />
                ))}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <aside className="space-y-6">
            <RecentContacts contacts={recentContacts} onSelect={handleEdit} />
          </aside>
        </div>
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl">{editingContact ? 'Edit' : 'Add'} Contact</DialogTitle>
          </DialogHeader>
          <ContactForm contact={editingContact} onSubmit={handleSubmit} onCancel={() => setFormOpen(false)} />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deletingId} onOpenChange={open => { if (!open) setDeletingId(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Contact</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone. This contact will be permanently removed.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Index;
