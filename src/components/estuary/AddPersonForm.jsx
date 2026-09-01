import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQueryClient } from "@tanstack/react-query";
import { UserPlus } from "lucide-react";

export default function AddPersonForm() {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const qc = useQueryClient();

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    await base44.entities.EstuaryPerson.create({ name: name.trim() });
    qc.invalidateQueries({ queryKey: ["estuaryPeople"] });
    setName("");
    setLoading(false);
  };

  return (
    <form id="tour-add-person" onSubmit={handleAdd} className="flex gap-2">
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Add a person to your estuary..."
        className="flex-1 px-4 py-2.5 rounded-xl border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
      />
      <button
        type="submit"
        disabled={loading || !name.trim()}
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold disabled:opacity-50 transition-colors hover:bg-primary/90"
      >
        <UserPlus className="h-4 w-4" />
        Add
      </button>
    </form>
  );
}