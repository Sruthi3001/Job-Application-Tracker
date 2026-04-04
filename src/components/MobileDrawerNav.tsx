import { useState, type ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Menu } from 'lucide-react';

export type MobileNavItem = {
  label: string;
  icon?: ReactNode;
  onSelect: () => void;
};

export function MobileDrawerNav({ items, title = 'Menu' }: { items: MobileNavItem[]; title?: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden shrink-0">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button type="button" variant="outline" size="icon" aria-label="Open navigation menu">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="flex w-[min(100vw-1rem,20rem)] flex-col sm:max-w-sm">
          <SheetHeader className="text-left">
            <SheetTitle>{title}</SheetTitle>
          </SheetHeader>
          <nav className="mt-6 flex flex-col gap-1 pr-2" aria-label="Main navigation">
            {items.map((item) => (
              <Button
                key={item.label}
                type="button"
                variant="ghost"
                className="h-11 w-full justify-start gap-2 px-3"
                onClick={() => {
                  item.onSelect();
                  setOpen(false);
                }}
              >
                {item.icon ? <span className="shrink-0 text-muted-foreground">{item.icon}</span> : null}
                <span className="truncate">{item.label}</span>
              </Button>
            ))}
          </nav>
        </SheetContent>
      </Sheet>
    </div>
  );
}
