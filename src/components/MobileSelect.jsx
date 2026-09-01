import { useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";

/**
 * MobileSelect — uses a bottom-sheet Drawer on mobile, standard Select popover on desktop.
 *
 * Props mirror shadcn/ui Select:
 *   value, onValueChange, placeholder, options: [{ value, label }], className
 */
export default function MobileSelect({ value, onValueChange, placeholder = "Select…", options = [], className = "" }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const selectedLabel = options.find(o => o.value === value)?.label ?? "";

  const handleSelect = (val) => {
    onValueChange(val);
    setDrawerOpen(false);
  };

  return (
    <>
      {/* Desktop — normal popover select */}
      <div className="hidden sm:block">
        <Select value={value} onValueChange={onValueChange}>
          <SelectTrigger className={className}>
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent>
            {options.map(o => (
              <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Mobile — bottom-sheet drawer */}
      <div className="sm:hidden">
        <button
          type="button"
          onClick={() => setDrawerOpen(true)}
          className={`flex h-9 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm ring-offset-background focus:outline-none focus:ring-1 focus:ring-ring ${className}`}
        >
          <span className={value ? "text-foreground" : "text-muted-foreground"}>
            {selectedLabel || placeholder}
          </span>
          <ChevronDown className="h-4 w-4 opacity-50 shrink-0" />
        </button>

        <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>{placeholder}</DrawerTitle>
            </DrawerHeader>
            <div className="pb-6 px-4 space-y-1">
              {options.map(o => (
                <button
                  key={o.value}
                  type="button"
                  onClick={() => handleSelect(o.value)}
                  className="w-full flex items-center justify-between px-4 py-3 rounded-lg text-sm hover:bg-secondary transition-colors"
                >
                  <span>{o.label}</span>
                  {value === o.value && <Check className="h-4 w-4 text-primary" />}
                </button>
              ))}
            </div>
          </DrawerContent>
        </Drawer>
      </div>
    </>
  );
}