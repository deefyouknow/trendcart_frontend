"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api, ApiRequestError } from "@/lib/api";
import { proxiedImageUrl } from "@/lib/image";
import { formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ImageOff } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { ProductListItem } from "@/lib/types";

export function AdminProductList({ initialProducts }: { initialProducts: ProductListItem[] }) {
  const [products, setProducts] = useState<ProductListItem[]>(initialProducts);
  
  // Sync state when initialProducts change (e.g. from search URL updates)
  useEffect(() => {
    setProducts(initialProducts);
  }, [initialProducts]);

  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteTitle, setDeleteTitle] = useState("");
  const [deleting, setDeleting] = useState(false);
  const router = useRouter();

  async function handleDelete() {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await api.deleteProduct(deleteId);
      setProducts((prev) => prev.filter((p) => p.id !== deleteId));
      setDeleteId(null);
      router.refresh(); // Refresh server data
    } catch (err) {
      if (err instanceof ApiRequestError) {
        alert(err.message);
      }
    } finally {
      setDeleting(false);
    }
  }

  return (
    <>
      <div className="space-y-2">
        {products.map((product) => (
          <Card key={product.id}>
            <CardContent className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4">
              {/* Thumbnail */}
              <div className="h-16 w-16 shrink-0 overflow-hidden rounded-md bg-muted">
                {product.images[0] ? (
                  <img
                    src={proxiedImageUrl(product.images[0])}
                    alt={product.title}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                    <ImageOff className="h-8 w-8" />
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <h3 className="font-medium truncate">{product.title}</h3>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  {product.category && (
                    <Badge variant="secondary">{product.category}</Badge>
                  )}
                  <span>{product.merchant_links_count} link(s)</span>
                  <span>·</span>
                  <span>{formatDate(product.updated_at)}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex w-full sm:w-auto items-center justify-end gap-2 shrink-0 mt-2 sm:mt-0">
                <Link href={`/admin/products/${product.id}/edit`}>
                  <Button variant="outline" size="sm">
                    Edit
                  </Button>
                </Link>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => {
                    setDeleteId(product.id);
                    setDeleteTitle(product.title);
                  }}
                >
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Delete confirmation dialog */}
      <Dialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Product</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &ldquo;{deleteTitle}&rdquo;? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)} disabled={deleting}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
              {deleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
