import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export default function CartSheet({ open, onClose }) {
  const qc = useQueryClient();
  const { data: items = [] } = useQuery({
    queryKey: ["cart"],
    queryFn: () => base44.entities.CartItem.list(),
  });

  const updateQty = useMutation({
    mutationFn: ({ id, quantity }) =>
      quantity < 1
        ? base44.entities.CartItem.delete(id)
        : base44.entities.CartItem.update(id, { quantity }),
    onMutate: async ({ id, quantity }) => {
      await qc.cancelQueries({ queryKey: ["cart"] });
      const prev = qc.getQueryData(["cart"]);
      qc.setQueryData(["cart"], (old = []) =>
        quantity < 1
          ? old.filter(i => i.id !== id)
          : old.map(i => i.id === id ? { ...i, quantity } : i)
      );
      return { prev };
    },
    onError: (_err, _vars, ctx) => qc.setQueryData(["cart"], ctx.prev),
    onSettled: () => qc.invalidateQueries({ queryKey: ["cart"] }),
  });

  const removeItem = useMutation({
    mutationFn: (id) => base44.entities.CartItem.delete(id),
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: ["cart"] });
      const prev = qc.getQueryData(["cart"]);
      qc.setQueryData(["cart"], (old = []) => old.filter(i => i.id !== id));
      return { prev };
    },
    onError: (_err, _vars, ctx) => qc.setQueryData(["cart"], ctx.prev),
    onSettled: () => qc.invalidateQueries({ queryKey: ["cart"] }),
  });

  const total = items.reduce((s, i) => s + i.price * (i.quantity || 1), 0);

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="flex flex-col">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5" /> Cart ({items.length})
          </SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground gap-3">
            <ShoppingBag className="h-12 w-12 opacity-30" />
            <p className="text-sm">Your cart is empty</p>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto space-y-4 py-4">
              {items.map((item) => (
                <div key={item.id} className="flex gap-3 items-start">
                  <div className="h-16 w-16 rounded-lg bg-muted flex-shrink-0 overflow-hidden">
                    {item.image_url ? (
                      <img src={item.image_url} className="h-full w-full object-cover" />
                    ) : (
                      <div className="h-full w-full bg-gradient-to-br from-primary/10 to-primary/5" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{item.product_name}</p>
                    <p className="text-sm text-primary font-semibold">${item.price.toFixed(2)}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <button
                        onClick={() => updateQty.mutate({ id: item.id, quantity: (item.quantity || 1) - 1 })}
                        className="h-6 w-6 rounded-md border flex items-center justify-center hover:bg-secondary"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="text-sm w-6 text-center">{item.quantity || 1}</span>
                      <button
                        onClick={() => updateQty.mutate({ id: item.id, quantity: (item.quantity || 1) + 1 })}
                        className="h-6 w-6 rounded-md border flex items-center justify-center hover:bg-secondary"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                      <button
                        onClick={() => removeItem.mutate(item.id)}
                        className="ml-auto p-1 text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="border-t pt-4 space-y-3">
              <div className="flex justify-between font-semibold text-lg">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
              <Button className="w-full" size="lg">
                Checkout
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}