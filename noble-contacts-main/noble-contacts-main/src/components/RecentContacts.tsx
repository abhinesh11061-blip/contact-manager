import { Contact } from '@/types/contact';
import { Clock, Heart } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface RecentContactsProps {
  contacts: Contact[];
  onSelect: (contact: Contact) => void;
}

/** Sidebar widget showing the 5 most recently added contacts */
export function RecentContacts({ contacts, onSelect }: RecentContactsProps) {
  if (contacts.length === 0) return null;

  return (
    <div className="rounded-xl border bg-card p-5">
      <h2 className="font-serif text-lg flex items-center gap-2 mb-4">
        <Clock className="h-4 w-4 text-primary" /> Recently Added
      </h2>
      <ul className="space-y-3">
        {contacts.map(c => (
          <li key={c.id}>
            <button
              onClick={() => onSelect(c)}
              className="w-full text-left flex items-center gap-3 rounded-lg p-2 -mx-2 hover:bg-muted transition-colors"
            >
              <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-semibold">
                {c.name[0]}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium truncate flex items-center gap-1">
                  {c.name}
                  {c.isFavorite && <Heart className="h-3 w-3 fill-favorite text-favorite" />}
                </p>
                <p className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(c.createdAt), { addSuffix: true })}</p>
              </div>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
