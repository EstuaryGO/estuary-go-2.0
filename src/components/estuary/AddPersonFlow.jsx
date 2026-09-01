import { useState, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { UserPlus, Camera, Loader2, User, ChevronDown, ChevronUp } from "lucide-react";

export default function AddPersonFlow() {
  const [name, setName] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [notes, setNotes] = useState("");
  const [uploading, setUploading] = useState(false);
  const [showExtras, setShowExtras] = useState(false);
  const fileRef = useRef();
  const qc = useQueryClient();

  const addMutation = useMutation({
    mutationFn: () =>
      base44.entities.EstuaryPerson.create({
        name: name.trim(),
        photo_url: photoUrl || undefined,
        notes: notes.trim() || undefined,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["estuaryPeople"] });
      setName("");
      setPhotoUrl("");
      setNotes("");
      setShowExtras(false);
    },
  });

  const handlePhoto = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setPhotoUrl(file_url);
    setUploading(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim() || addMutation.isPending) return;
    addMutation.mutate();
  };

  return (
    <div className="rounded-2xl border border-border bg-card p-4 space-y-3">
      <div className="flex items-center gap-2 text-primary">
        <UserPlus className="h-5 w-5" />
        <h2 className="text-sm font-bold">Add someone to your Estuary</h2>
      </div>
      <form id="tour-add-person" onSubmit={handleSubmit} className="space-y-3">
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden border-2 border-dashed border-primary/30 hover:border-primary/60 transition-colors shrink-0"
          >
            {uploading ? (
              <Loader2 className="h-5 w-5 text-primary animate-spin" />
            ) : photoUrl ? (
              <img src={photoUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              <User className="h-6 w-6 text-primary/40" />
            )}
          </button>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhoto} />
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Their name…"
            className="flex-1 px-4 py-3 rounded-xl border border-border bg-background text-base focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
        </div>

        {showExtras && (
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Notes about this person (optional)…"
            rows={2}
            className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none"
          />
        )}

        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => setShowExtras((s) => !s)}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
          >
            {showExtras ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            {showExtras ? "Hide notes" : "Add notes"}
          </button>
          <button
            type="submit"
            disabled={!name.trim() || addMutation.isPending || uploading}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold disabled:opacity-50 hover:bg-primary/90 transition-colors"
          >
            {addMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
            Add to Estuary
          </button>
        </div>
      </form>
    </div>
  );
}