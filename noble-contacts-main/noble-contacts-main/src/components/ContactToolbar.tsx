import { ContactFilters, ContactGroup, SortOption } from '@/types/contact';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Search, Heart, Upload, Download, Plus } from 'lucide-react';
import { useRef } from 'react';

interface ContactToolbarProps {
  filters: ContactFilters;
  onFiltersChange: (filters: ContactFilters) => void;
  totalCount: number;
  filteredCount: number;
  onAdd: () => void;
  onExport: () => void;
  onImport: (file: File) => void;
}

const GROUPS: (ContactGroup | 'All')[] = ['All', 'Family', 'Friends', 'Work', 'Other'];
const SORTS: { value: SortOption; label: string }[] = [
  { value: 'name-asc', label: 'A → Z' },
  { value: 'name-desc', label: 'Z → A' },
  { value: 'recent', label: 'Newest' },
  { value: 'oldest', label: 'Oldest' },
];

/** Toolbar with search, filters, sort, and import/export actions */
export function ContactToolbar({ filters, onFiltersChange, totalCount, filteredCount, onAdd, onExport, onImport }: ContactToolbarProps) {
  const fileRef = useRef<HTMLInputElement>(null);

  const update = (partial: Partial<ContactFilters>) => onFiltersChange({ ...filters, ...partial });

  return (
    <div className="space-y-4">
      {/* Top row: count + action buttons */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-serif">Contacts</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {filteredCount} of {totalCount} contact{totalCount !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button size="sm" variant="outline" onClick={onExport}><Download className="h-4 w-4 mr-1.5" />Export</Button>
          <Button size="sm" variant="outline" onClick={() => fileRef.current?.click()}>
            <Upload className="h-4 w-4 mr-1.5" />Import
          </Button>
          <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={e => { if (e.target.files?.[0]) onImport(e.target.files[0]); e.target.value = ''; }} />
          <Button size="sm" onClick={onAdd}><Plus className="h-4 w-4 mr-1.5" />Add Contact</Button>
        </div>
      </div>

      {/* Filter row */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search by name or phone..." className="pl-9" value={filters.search} onChange={e => update({ search: e.target.value })} />
        </div>
        <Select value={filters.group} onValueChange={v => update({ group: v as ContactGroup | 'All' })}>
          <SelectTrigger className="w-[130px]"><SelectValue /></SelectTrigger>
          <SelectContent>{GROUPS.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}</SelectContent>
        </Select>
        <Select value={filters.sort} onValueChange={v => update({ sort: v as SortOption })}>
          <SelectTrigger className="w-[120px]"><SelectValue /></SelectTrigger>
          <SelectContent>{SORTS.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}</SelectContent>
        </Select>
        <Button
          size="icon"
          variant={filters.favoritesOnly ? 'default' : 'outline'}
          onClick={() => update({ favoritesOnly: !filters.favoritesOnly })}
          aria-label="Filter favorites"
        >
          <Heart className={`h-4 w-4 ${filters.favoritesOnly ? 'fill-current' : ''}`} />
        </Button>
      </div>
    </div>
  );
}
