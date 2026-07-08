"use client";

import { use, useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { api, ApiRequestError } from "@/lib/api";
import { ProductForm } from "@/components/admin/product-form";
import { MerchantLinkForm } from "@/components/admin/merchant-link-form";
import { VariantForm } from "@/components/admin/variant-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatPrice, formatDate, timeAgo } from "@/lib/utils";
import { PLATFORM_CONFIG, STOCK_STATUS_LABELS, STOCK_STATUS_COLORS } from "@/lib/constants";
import type { ProductDetail, MerchantLink, Variant } from "@/lib/types";

export default function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Merchant link dialog state
  const [mlOpen, setMlOpen] = useState(false);
  const [mlEdit, setMlEdit] = useState<MerchantLink | null>(null);
  const [mlDelete, setMlDelete] = useState<MerchantLink | null>(null);
  const [mlDeleting, setMlDeleting] = useState(false);

  // Variant dialog state
  const [vOpen, setVOpen] = useState(false);
  const [vEdit, setVEdit] = useState<Variant | null>(null);
  const [vMlId, setVMlId] = useState<string>("");
  const [vDelete, setVDelete] = useState<Variant | null>(null);
  const [vDeleting, setVDeleting] = useState(false);

  const loadProduct = useCallback(async () => {
    try {
      const res = await api.getAdminProduct(id);
      setProduct(res);
    } catch (err) {
      if (err instanceof ApiRequestError) {
        setError(err.message);
      } else {
        setError("Failed to load product");
      }
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadProduct();
  }, [loadProduct]);

  // Verify price
  async function handleVerifyPrice(ml: MerchantLink) {
    try {
      await api.updateMerchantLink(ml.id, {
        price_checked_at: new Date().toISOString(),
      });
      loadProduct();
    } catch (err) {
      if (err instanceof ApiRequestError) {
        alert(err.message);
      }
    }
  }

  // Delete merchant link
  async function handleDeleteMl() {
    if (!mlDelete) return;
    setMlDeleting(true);
    try {
      await api.deleteMerchantLink(mlDelete.id);
      setMlDelete(null);
      loadProduct();
    } catch (err) {
      if (err instanceof ApiRequestError) {
        alert(err.message);
      }
    } finally {
      setMlDeleting(false);
    }
  }

  // Delete variant
  async function handleDeleteVariant() {
    if (!vDelete) return;
    setVDeleting(true);
    try {
      await api.deleteVariant(vDelete.id);
      setVDelete(null);
      loadProduct();
    } catch (err) {
      if (err instanceof ApiRequestError) {
        alert(err.message);
      }
    } finally {
      setVDeleting(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 animate-pulse rounded bg-muted" />
        <div className="h-64 animate-pulse rounded-lg bg-muted" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="rounded-md bg-destructive/10 p-4 text-sm text-destructive">
        {error || "Product not found"}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Edit Product</h1>
        <p className="text-sm text-muted-foreground">
          Manage product details, merchant links, and variants.
        </p>
      </div>

      {/* Product form */}
      <Card>
        <CardHeader>
          <CardTitle>Product Details</CardTitle>
        </CardHeader>
        <CardContent>
          <ProductForm
            initialData={{
              title: product.title,
              description: product.description,
              category: product.category,
              images: product.images,
            }}
            submitLabel="Save Changes"
            onSubmit={async (data) => {
              await api.updateProduct(id, data);
              loadProduct();
            }}
          />
        </CardContent>
      </Card>

      {/* Merchant Links */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Merchant Links</CardTitle>
          <Button
            size="sm"
            onClick={() => {
              setMlEdit(null);
              setMlOpen(true);
            }}
          >
            + Add Link
          </Button>
        </CardHeader>
        <CardContent>
          {product.merchant_links.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">
              No merchant links yet. Add one to start tracking prices.
            </p>
          ) : (
            <div className="space-y-4">
              {product.merchant_links.map((ml) => {
                const platformConfig = PLATFORM_CONFIG[ml.platform];
                return (
                  <div
                    key={ml.id}
                    className="rounded-lg border p-4 space-y-3"
                  >
                    {/* ML header */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <Badge
                          className={platformConfig.bgClass + " " + platformConfig.textClass}
                        >
                          {platformConfig.label}
                        </Badge>
                        <span className="font-medium">{ml.store_name}</span>
                      </div>
                      <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleVerifyPrice(ml)}
                        >
                          ✓ Verify Price
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setMlEdit(ml);
                            setMlOpen(true);
                          }}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => setMlDelete(ml)}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>

                    {/* ML details */}
                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground min-w-0">
                      <a
                        href={ml.affiliate_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline hover:text-foreground truncate max-w-[200px] sm:max-w-xs"
                      >
                        {ml.affiliate_url}
                      </a>
                      {ml.is_price_estimated && (
                        <Badge variant="secondary">Estimated</Badge>
                      )}
                      {ml.price_checked_at && (
                        <span>Checked {timeAgo(ml.price_checked_at)}</span>
                      )}
                    </div>

                    {/* Variants */}
                    <div className="border-t pt-3">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-medium">Variants</p>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setVEdit(null);
                            setVMlId(ml.id);
                            setVOpen(true);
                          }}
                        >
                          + Add
                        </Button>
                      </div>
                      {ml.variants.length === 0 ? (
                        <p className="text-xs text-muted-foreground">
                          No variants
                        </p>
                      ) : (
                        <div className="space-y-1">
                          {ml.variants.map((v) => (
                            <div
                              key={v.id}
                              className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-md bg-muted/50 px-3 py-2 text-sm min-w-0"
                            >
                              <div className="flex flex-wrap items-center gap-3 min-w-0">
                                <span className="truncate max-w-[180px] sm:max-w-xs">{v.variant_name}</span>
                                <span className="font-medium">
                                  {formatPrice(v.price, v.currency)}
                                </span>
                                <Badge
                                  variant="secondary"
                                  className={STOCK_STATUS_COLORS[v.stock_status]}
                                >
                                  {STOCK_STATUS_LABELS[v.stock_status]}
                                </Badge>
                              </div>
                              <div className="flex items-center gap-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 px-2"
                                  onClick={() => {
                                    setVEdit(v);
                                    setVMlId(ml.id);
                                    setVOpen(true);
                                  }}
                                >
                                  Edit
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 px-2 text-destructive hover:text-destructive"
                                  onClick={() => setVDelete(v)}
                                >
                                  Delete
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Merchant Link Form Dialog */}
      <MerchantLinkForm
        open={mlOpen}
        onOpenChange={setMlOpen}
        productId={id}
        existingLink={mlEdit}
        onSuccess={loadProduct}
      />

      {/* Variant Form Dialog */}
      <VariantForm
        open={vOpen}
        onOpenChange={setVOpen}
        merchantLinkId={vMlId}
        existingVariant={vEdit}
        onSuccess={loadProduct}
      />

      {/* Delete Merchant Link Dialog */}
      <Dialog open={!!mlDelete} onOpenChange={(o) => !o && setMlDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Merchant Link</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the {mlDelete?.store_name} link?
              All variants will be removed. This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setMlDelete(null)} disabled={mlDeleting}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteMl} disabled={mlDeleting}>
              {mlDeleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Variant Dialog */}
      <Dialog open={!!vDelete} onOpenChange={(o) => !o && setVDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Variant</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete variant &ldquo;{vDelete?.variant_name}&rdquo;?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setVDelete(null)} disabled={vDeleting}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteVariant} disabled={vDeleting}>
              {vDeleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
