import { JobApplication, ApplicationStatus, STATUS_CONFIG } from '@/lib/types';
import { StatusBadge } from './StatusBadge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Pencil, Trash2, ExternalLink } from 'lucide-react';

interface Props {
  applications: JobApplication[];
  onEdit: (app: JobApplication) => void;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, status: ApplicationStatus) => void;
  selectedIds?: string[];
  onToggleSelect?: (id: string) => void;
  onToggleSelectAll?: (checked: boolean) => void;
}

export function ApplicationTable({
  applications,
  onEdit,
  onDelete,
  onStatusChange,
  selectedIds = [],
  onToggleSelect,
  onToggleSelectAll,
}: Props) {
  if (applications.length === 0) {
    return (
      <div className="rounded-xl border bg-card p-12 text-center">
        <p className="text-muted-foreground">No applications found. Add your first one!</p>
      </div>
    );
  }

  const selectable = Boolean(onToggleSelect && onToggleSelectAll);
  const allSelected = selectable && applications.every(a => selectedIds.includes(a.id));
  const someSelected = selectable && !allSelected && applications.some(a => selectedIds.includes(a.id));

  return (
    <div className="touch-pan-x rounded-xl border bg-card shadow-sm overflow-x-auto [-webkit-overflow-scrolling:touch]">
      <Table className="min-w-[44rem]">
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            {selectable && (
              <TableHead className="w-[44px]">
                <Checkbox
                  checked={allSelected ? true : someSelected ? 'indeterminate' : false}
                  onCheckedChange={value => onToggleSelectAll?.(value === true)}
                  aria-label="Select all applications"
                />
              </TableHead>
            )}
            <TableHead className="font-semibold">Company</TableHead>
            <TableHead className="font-semibold">Role</TableHead>
            <TableHead className="font-semibold">Location</TableHead>
            <TableHead className="font-semibold">Status</TableHead>
            <TableHead className="font-semibold">Type</TableHead>
            <TableHead className="font-semibold">Date</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {applications.map(app => (
            <TableRow
              key={app.id}
              data-state={selectedIds.includes(app.id) ? 'selected' : undefined}
              className="group cursor-pointer"
              onClick={() => onEdit(app)}
            >
              {selectable && (
                <TableCell onClick={e => e.stopPropagation()}>
                  <Checkbox
                    checked={selectedIds.includes(app.id)}
                    onCheckedChange={() => onToggleSelect?.(app.id)}
                    aria-label={`Select ${app.company} ${app.role}`}
                  />
                </TableCell>
              )}
              <TableCell className="font-medium">{app.company}</TableCell>
              <TableCell>{app.role}</TableCell>
              <TableCell className="text-muted-foreground">{app.location}</TableCell>
              <TableCell><StatusBadge status={app.status} /></TableCell>
              <TableCell className="text-muted-foreground capitalize">{app.type}</TableCell>
              <TableCell className="text-muted-foreground">{new Date(app.dateApplied).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild onClick={e => e.stopPropagation()}>
                    <Button variant="ghost" size="icon" className="h-8 w-8 opacity-100 transition-opacity md:opacity-0 md:group-hover:opacity-100">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" onClick={e => e.stopPropagation()}>
                    <DropdownMenuItem onClick={() => onEdit(app)}>
                      <Pencil className="mr-2 h-3.5 w-3.5" /> Edit
                    </DropdownMenuItem>
                    {app.url && (
                      <DropdownMenuItem onClick={() => window.open(app.url, '_blank')}>
                        <ExternalLink className="mr-2 h-3.5 w-3.5" /> Open Link
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    {(Object.keys(STATUS_CONFIG) as ApplicationStatus[]).filter(s => s !== app.status).map(s => (
                      <DropdownMenuItem key={s} onClick={() => onStatusChange(app.id, s)}>
                        Move to {STATUS_CONFIG[s].label}
                      </DropdownMenuItem>
                    ))}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => onDelete(app.id)}>
                      <Trash2 className="mr-2 h-3.5 w-3.5" /> Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
