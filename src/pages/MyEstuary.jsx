import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import AddPersonForm from "@/components/estuary/AddPersonForm";
import PersonCard from "@/components/estuary/PersonCard";


export default function MyEstuary() {
  const [sortBy, setSortBy] = useState("date");

  const { data: people = [], isLoading } = useQuery({
    queryKey: ["estuaryPeople", sortBy],
    queryFn: () => base44.entities.EstuaryPerson.list(sortBy === "name" ? "name" : "-created_date"),
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-1">
          <img src="https://media.base44.com/images/public/6a1204d6712923c845a17a9d/e16740db9_icon.png" alt="" className="h-6 w-6 object-contain" />
          <h1 className="text-2xl font-bold text-foreground">My Estuary</h1>
        </div>
        <p className="text-sm text-muted-foreground ml-9">
          This is your Digital Field Guide, where you can track the steps you are taking to have a gospel impact on the people Jesus is sending you to.
        </p>
      </div>

      {/* Add person */}
      <AddPersonForm />

      {/* Sort controls */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground">Sort by:</span>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="text-xs border border-border rounded-lg px-2 py-1 bg-background text-foreground"
        >
          <option value="date">Date Added</option>
          <option value="name">A–Z</option>
        </select>
      </div>

      {/* People list */}
      {isLoading ? (
        <div className="flex justify-center py-10">
          <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
        </div>
      ) : people.length === 0 ? (
        <div className="text-center py-14 space-y-2">
          <img src="https://media.base44.com/images/public/6a1204d6712923c845a17a9d/e16740db9_icon.png" alt="" className="h-10 w-10 object-contain opacity-20 mx-auto" />
          <p className="text-sm text-muted-foreground">Your Estuary is empty. Add someone to get started.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {people.map((person) => (
            <PersonCard key={person.id} person={person} />
          ))}
        </div>
      )}
    </div>
  );
}