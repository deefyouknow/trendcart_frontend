"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { api, ApiRequestError } from "@/lib/api";
import { proxiedImageUrl } from "@/lib/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatDate } from "@/lib/utils";
import type { ProductListItem } from "@/lib/types";

export default function AdminProductsPage() {
  const [products, setProducts] = useState<ProductListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteTitle, setDeleteTitle] = useState("");
  const [deleting, setDeleting] = useState(false);

  const loadProducts = useCallback(async (p: number) => {
    setLoading(true);
    try {
      const res = await api.getAdminProducts({ page: p, limit: 20 });
      setProducts(res.products);
      setTotal(res.total);
    } catch {
      // handle error silently
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProducts(page);
  }, [page, loadProducts]);

  async function handleDelete() {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await api.deleteProduct(deleteId);
      setProducts((prev) => prev.filter((p) => p.id !== deleteId));
      setTotal((prev) => prev - 1);
      setDeleteId(null);
    } catch (err) {
      if (err instanceof ApiRequestError) {
        alert(err.message);
      }
    } finally {
      setDeleting(false);
    }
  }

  const totalPages = Math.ceil(total / 20);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Products</h1>
          <p className="text-sm text-muted-foreground">
            {total} product{total !== 1 ? "s" : ""} total
          </p>
        </div>
        <Link href="/admin/products/new">
          <Button>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14" />
              <path d="M12 5v14" />
            </svg>
            New Product
          </Button>
        </Link>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-20 animate-pulse rounded-lg bg-muted" />
          ))}
        </div>
      ) : products.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground mb-4">No products yet</p>
            <Link href="/admin/products/new">
              <Button>Create your first product</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="space-y-2">
            {products.map((product) => (
              <Card key={product.id}>
                <CardContent className="flex items-center gap-4 p-4">
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
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
                          <circle cx="9" cy="9" r="2" />
                          <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
                        </svg>
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
                  <div className="flex items-center gap-2 shrink-0">
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

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}

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
    </div>
  );
}
