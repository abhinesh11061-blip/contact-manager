import { Contact } from '@/types/contact';
import { Heart, Pencil, Trash2, Mail, Phone, MapPin } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

/** Color mapping for contact group badges */
const GROUP_COLORS: Record<string, string> = {
  Family: 'bg-primary/15 text-primary border-primary/20',
  Friends: 'bg-accent/15 text-accent border-accent/20',
  Work: 'bg-warning/15 text-warning-foreground border-warning/20',
  Other: 'bg-muted text-muted-foreground border-border',
};

interface ContactCardProps {
  contact: Contact;
  onEdit: (contact: Contact) => void;
  onDelete: (id: string) => void;
  onToggleFavorite: (id: string) => void;
}

/** Displays a single contact as a card with actions */
export function ContactCard({ contact, onEdit, onDelete, onToggleFavorite }: ContactCardProps) {
  /** Get initials from contact name for the avatar */
  const initials = contact.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

  return (
    <div className="group relative rounded-xl border bg-card p-5 transition-all hover:shadow-md hover:border-primary/30">
      {/* Favorite button */}
      <button
        onClick={() => onToggleFavorite(contact.id)}
        className="absolute top-4 right-4 transition-transform hover:scale-110"
        aria-label="Toggle favorite"
      >
        <Heart className={`h-5 w-5 transition-colors ${contact.isFavorite ? 'fill-favorite text-favorite' : 'text-muted-foreground hover:text-favorite'}`} />
      </button>

      <div className="flex gap-4">
        {/* Avatar circle with initials */}
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold text-lg">
          {initials}
        </div>

        <div className="min-w-0 flex-1 space-y-2">
          <div>
            <h3 className="font-serif text-lg font-medium truncate pr-8">{contact.name}</h3>
            <Badge variant="outline" className={`text-xs mt-1 ${GROUP_COLORS[contact.group] || ''}`}>
              {contact.group}
            </Badge>
          </div>

          <div className="space-y-1 text-sm text-muted-foreground">
            <div className="flex items-center gap-2"><Phone className="h-3.5 w-3.5" /><span>{contact.phone}</span></div>
            {contact.email && <div className="flex items-center gap-2"><Mail className="h-3.5 w-3.5" /><span className="truncate">{contact.email}</span></div>}
            {contact.address && <div className="flex items-center gap-2"><MapPin className="h-3.5 w-3.5" /><span className="truncate">{contact.address}</span></div>}
          </div>
        </div>
      </div>

      {/* Action buttons shown on hover */}
      <div className="absolute bottom-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => onEdit(contact)} aria-label="Edit">
          <Pencil className="h-4 w-4" />
        </Button>
        <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => onDelete(contact.id)} aria-label="Delete">
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
