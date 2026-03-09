import { useState } from 'react';
import { Contact, ContactFormData, ContactGroup } from '@/types/contact';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Heart } from 'lucide-react';

const GROUPS: ContactGroup[] = ['Family', 'Friends', 'Work', 'Other'];

interface ContactFormProps {
  /** Existing contact for editing, null for new */
  contact?: Contact | null;
  onSubmit: (data: ContactFormData) => string | null;
  onCancel: () => void;
}

/** Form component for adding/editing contacts with validation */
export function ContactForm({ contact, onSubmit, onCancel }: ContactFormProps) {
  const [name, setName] = useState(contact?.name || '');
  const [phone, setPhone] = useState(contact?.phone || '');
  const [email, setEmail] = useState(contact?.email || '');
  const [address, setAddress] = useState(contact?.address || '');
  const [group, setGroup] = useState<ContactGroup>(contact?.group || 'Other');
  const [isFavorite, setIsFavorite] = useState(contact?.isFavorite || false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  /** Validate all fields and return true if valid */
  function validate(): boolean {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = 'Name is required';
    if (!phone.trim()) e.phone = 'Phone is required';
    else if (!/^\d+$/.test(phone.trim())) e.phone = 'Phone must be numeric';
    if (email && !email.includes('@')) e.email = 'Email must contain @';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    const err = onSubmit({ name: name.trim(), phone: phone.trim(), email: email.trim(), address: address.trim(), group, isFavorite });
    if (err) setErrors({ phone: err });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="name">Name *</Label>
        <Input id="name" value={name} onChange={e => setName(e.target.value)} placeholder="John Doe" />
        {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">Phone Number *</Label>
        <Input id="phone" value={phone} onChange={e => setPhone(e.target.value)} placeholder="5551234567" />
        {errors.phone && <p className="text-sm text-destructive">{errors.phone}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="john@example.com" />
        {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="address">Address</Label>
        <Textarea id="address" value={address} onChange={e => setAddress(e.target.value)} placeholder="123 Main St, City" rows={2} />
      </div>

      <div className="space-y-2">
        <Label>Group</Label>
        <Select value={group} onValueChange={v => setGroup(v as ContactGroup)}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            {GROUPS.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-3">
        <Switch id="favorite" checked={isFavorite} onCheckedChange={setIsFavorite} />
        <Label htmlFor="favorite" className="flex items-center gap-1.5 cursor-pointer">
          <Heart className="h-4 w-4 text-favorite" /> Favorite
        </Label>
      </div>

      <div className="flex gap-3 pt-2">
        <Button type="submit" className="flex-1">{contact ? 'Update' : 'Add'} Contact</Button>
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1">Cancel</Button>
      </div>
    </form>
  );
}
