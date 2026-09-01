import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { ChevronDown, ChevronUp, Trash2, User, Pencil } from "lucide-react";
import JournalSection from "./JournalSection";
import EditPersonModal from "./EditPersonModal";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function PersonCard({ person }) {
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const qc = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: () => base44.entities.EstuaryPerson.delete(person.id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["estuaryPeople"] }),
  });

  return (
    <>
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <button
          onClick={() => setOpen(!open)}
          className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-secondary/40 transition-colors text-left"
        >
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0 overflow-hidden">
              {person.photo_url
                ? <img src={person.photo_url} alt={person.name} className="h-full w-full object-cover" />
                : <User className="h-4 w-4 text-primary" />}
            </div>
            <span className="font-semibold text-sm text-foreground">{person.name}</span>
            {/* Edit icon sits right next to the name */}
            <button
              onClick={(e) => { e.stopPropagation(); setEditOpen(true); }}
              className="p-1 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
            >
              <Pencil className="h-3.5 w-3.5" />
            </button>
          </div>
          {/* Only chevron on the right — delete moved inside expanded section */}
          <div className="flex items-center">
            {open ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
          </div>
        </button>

        {open && (
          <div className="px-4 pb-4 pt-1 border-t border-border space-y-3">
            <JournalSection personId={person.id} personName={person.name} />
            <div className="pt-1 flex justify-end">
              <button
                onClick={() => setDeleteOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-destructive hover:bg-destructive/10 transition-colors"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Remove from Field Guide
              </button>
            </div>
          </div>
        )}
      </div>

      <EditPersonModal person={person} open={editOpen} onClose={() => setEditOpen(false)} />

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove {person.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove {person.name} and all their journal entries from your Field Guide. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteMutation.mutate()}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}