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
import type { MerchantLink, Platform } from "@/lib/types";

interface MerchantLinkFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productId: string;
  existingLink?: MerchantLink | null;
  onSuccess: () => void;
}

const PLATFORMS: { value: Platform; label: string }[] = [
  { value: "shopee", label: "Shopee" },
  { value: "lazada", label: "Lazada" },
  { value: "tiktok", label: "TikTok Shop" },
  { value: "other", label: "Other" },
];

export function MerchantLinkForm({
  open,
  onOpenChange,
  productId,
  existingLink,
  onSuccess,
}: MerchantLinkFormProps) {
  const isEditing = !!existingLink;

  const [platform, setPlatform] = useState<Platform>(
    existingLink?.platform || "shopee"
  );
  const [storeName, setStoreName] = useState(existingLink?.store_name || "");
  const [affiliateUrl, setAffiliateUrl] = useState(
    existingLink?.affiliate_url || ""
  );
  const [variantName, setVariantName] = useState(
    existingLink?.variants?.[0]?.variant_name || "Default"
  );
  const [price, setPrice] = useState(
    existingLink?.variants?.[0]?.price?.toString() || ""
  );
  const [currency, setCurrency] = useState(
    existingLink?.variants?.[0]?.currency || "THB"
  );
  const [stockStatus, setStockStatus] = useState<string>(
    existingLink?.variants?.[0]?.stock_status || "in_stock"
  );
  const [isPriceEstimated, setIsPriceEstimated] = useState(
    existingLink?.is_price_estimated ?? true
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleClose() {
    onOpenChange(false);
    setError("");
    // Reset form
    if (!isEditing) {
      setPlatform("shopee");
      setStoreName("");
      setAffiliateUrl("");
      setVariantName("Default");
      setPrice("");
      setCurrency("THB");
      setStockStatus("in_stock");
      setIsPriceEstimated(true);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isEditing && existingLink) {
        await api.updateMerchantLink(existingLink.id, {
          store_name: storeName,
          affiliate_url: affiliateUrl,
          is_price_estimated: isPriceEstimated,
        });
      } else {
        await api.createMerchantLink(productId, {
          platform,
          store_name: storeName,
          affiliate_url: affiliateUrl,
          is_price_estimated: isPriceEstimated,
          variants: [
            {
              variant_name: variantName,
              price: parseFloat(price),
              currency,
              stock_status: stockStatus,
            },
          ],
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
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Merchant Link" : "Add Merchant Link"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update the merchant link details."
              : "Add a new marketplace link with at least one variant."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          {/* Platform — only on create */}
          {!isEditing && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Platform</label>
              <select
                value={platform}
                onChange={(e) => setPlatform(e.target.value as Platform)}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                {PLATFORMS.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium">Store Name</label>
            <Input
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
              placeholder="e.g. Shop ABC Official"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Affiliate URL</label>
            <Input
              value={affiliateUrl}
              onChange={(e) => setAffiliateUrl(e.target.value)}
              placeholder="https://..."
              required
              type="url"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="is_estimated"
              checked={isPriceEstimated}
              onChange={(e) => setIsPriceEstimated(e.target.checked)}
              className="h-4 w-4 rounded border-input"
            />
            <label htmlFor="is_estimated" className="text-sm text-muted-foreground">
              Price is estimated
            </label>
          </div>

          {/* Variant fields — only on create */}
          {!isEditing && (
            <>
              <div className="border-t pt-4">
                <p className="text-sm font-medium mb-3">Initial Variant</p>
                <div className="space-y-3">
                  <div className="space-y-2">
                    <label className="text-sm text-muted-foreground">Variant Name</label>
                    <Input
                      value={variantName}
                      onChange={(e) => setVariantName(e.target.value)}
                      placeholder="e.g. Default, Red / L"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <label className="text-sm text-muted-foreground">Price</label>
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
                      <label className="text-sm text-muted-foreground">Currency</label>
                      <Input
                        value={currency}
                        onChange={(e) => setCurrency(e.target.value)}
                        placeholder="THB"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm text-muted-foreground">Stock Status</label>
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
                </div>
              </div>
            </>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : isEditing ? "Save Changes" : "Add Link"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
