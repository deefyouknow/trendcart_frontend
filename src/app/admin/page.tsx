"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { useAuth } from "@/components/auth/auth-provider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { ProductListResponse } from "@/lib/types";

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<{ totalProducts: number } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await api.getAdminProducts({ limit: 1 });
        setStats({ totalProducts: res.total });
      } catch {
        // ignore — stats are non-critical
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Welcome back, {user?.display_name || "Creator"}
        </h1>
        <p className="text-muted-foreground">
          Manage your products and affiliate links from here.
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Products</CardDescription>
            <CardTitle className="text-2xl">
              {loading ? "—" : stats?.totalProducts ?? 0}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Quick Actions</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/admin/products/new">
              <Button size="sm" className="w-full">
                + New Product
              </Button>
            </Link>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>View Store</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/products">
              <Button size="sm" variant="outline" className="w-full">
                Open Storefront
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Getting started */}
      <Card>
        <CardHeader>
          <CardTitle>Getting Started</CardTitle>
          <CardDescription>Steps to set up your first product</CardDescription>
        </CardHeader>
        <CardContent>
          <ol className="space-y-3 text-sm text-muted-foreground">
            <li className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent/10 text-accent text-xs font-bold">
                1
              </span>
              <span>Create a product with title, description, and category</span>
            </li>
            <li className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent/10 text-accent text-xs font-bold">
                2
              </span>
              <span>Upload product images (auto-optimized to WebP)</span>
            </li>
            <li className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent/10 text-accent text-xs font-bold">
                3
              </span>
              <span>Add merchant links from Shopee, Lazada, or TikTok Shop</span>
            </li>
            <li className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent/10 text-accent text-xs font-bold">
                4
              </span>
              <span>Add variants (size, color, etc.) with prices for each link</span>
            </li>
            <li className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent/10 text-accent text-xs font-bold">
                5
              </span>
              <span>Verify prices are up to date — your storefront is live!</span>
            </li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}
