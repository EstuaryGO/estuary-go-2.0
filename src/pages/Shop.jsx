import { Package } from "lucide-react";

export default function Shop() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center space-y-4">
      <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center mb-2">
        <Package className="h-10 w-10 text-primary/50" />
      </div>
      <h1 className="text-2xl font-bold tracking-tight">GO! Box</h1>
      <p className="text-muted-foreground max-w-xs">
        Ordering will be available soon. Stay tuned!
      </p>
    </div>
  );
}