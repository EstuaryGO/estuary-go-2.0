import { useState, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Camera, Loader2, User } from "lucide-react";

export default function EditPersonModal({ person, open, onClose }) {
  const [name, setName] = useState(person.name);
  const [photoUrl, setPhotoUrl] = useState(person.photo_url || "");
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef();
  const qc = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: (data) => base44.entities.EstuaryPerson.update(person.id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["estuaryPeople"] });
      onClose();
    },
  });

  const handlePhotoChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setPhotoUrl(file_url);
    setUploading(false);
  };

  const handleSave = () => {
    if (!name.trim()) return;
    updateMutation.mutate({ name: name.trim(), photo_url: photoUrl });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Edit Person</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Photo */}
          <div className="flex flex-col items-center gap-3">
            <button
              onClick={() => fileRef.current?.click()}
              className="relative h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden border-2 border-dashed border-primary/30 hover:border-primary/60 transition-colors"
            >
              {uploading ? (
                <Loader2 className="h-5 w-5 text-primary animate-spin" />
              ) : photoUrl ? (
                <img src={photoUrl} alt={name} className="h-full w-full object-cover" />
              ) : (
                <User className="h-8 w-8 text-primary/40" />
              )}
              <div className="absolute bottom-0 left-0 right-0 bg-black/40 py-1 flex justify-center">
                <Camera className="h-3 w-3 text-white" />
              </div>
            </button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
            <p className="text-xs text-muted-foreground">Tap to upload a photo</p>
          </div>

          {/* Name */}
          <div className="space-y-1.5">
            <Label>Name</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Person's name"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} disabled={!name.trim() || updateMutation.isPending}>
            {updateMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}