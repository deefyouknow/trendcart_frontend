"use client";

import { useState } from "react";
import { api, ApiRequestError } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Variant } from "@/lib/types";

interface VariantFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  merchantLinkId: string;
  existingVariant?: Variant | null;
  onSuccess: () => void;
}

export function VariantForm({
  open,
  onOpenChange,
  merchantLinkId,
  existingVariant,
  onSuccess,
}: VariantFormProps) {
  const isEditing = !!existingVariant;

  const [variantName, setVariantName] = useState(
    existingVariant?.variant_name || ""
  );
  const [price, setPrice] = useState(
    existingVariant?.price?.toString() || ""
  );
  const [currency, setCurrency] = useState(existingVariant?.currency || "THB");
  const [stockStatus, setStockStatus] = useState<string>(
    existingVariant?.stock_status || "in_stock"
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleClose() {
    onOpenChange(false);
    setError("");
    if (!isEditing) {
      setVariantName("");
      setPrice("");
      setCurrency("THB");
      setStockStatus("in_stock");
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isEditing && existingVariant) {
        await api.updateVariant(existingVariant.id, {
          variant_name: variantName,
          price: parseFloat(price),
          currency,
          stock_status: stockStatus,
        });
      } else {
        await api.createVariant(merchantLinkId, {
          variant_name: variantName,
          price: parseFloat(price),
          currency,
          stock_status: stockStatus,
        });
      }
      handleClose();
      onSuccess();
    } catch (err) {
      if (err instanceof ApiRequestError) {
        setError(err.message);
      } else {
        setError("Something went wrong");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Variant" : "Add Variant"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update the variant details."
              : "Add a new variant to this merchant link."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium">Variant Name</label>
            <Input
              value={variantName}
              onChange={(e) => setVariantName(e.target.value)}
              placeholder="e.g. Red / XL, 256GB"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <label className="text-sm font-medium">Price</label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="299.00"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Currency</label>
              <Input
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                placeholder="THB"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Stock Status</label>
            <select
              value={stockStatus}
              onChange={(e) => setStockStatus(e.target.value)}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="in_stock">In Stock</option>
              <option value="out_of_stock">Out of Stock</option>
              <option value="unknown">Unknown</option>
            </select>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : isEditing ? "Save Changes" : "Add Variant"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
