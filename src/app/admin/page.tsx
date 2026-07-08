"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { useAuth } from "@/components/auth/auth-provider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, ExternalLink } from "lucide-react";

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
        // ignore
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col gap-1.5">
        <h1 className="text-3xl font-bold tracking-tight text-foreground break-words">
          Welcome, {user?.display_name || "Creator"}
        </h1>
        <p className="text-muted-foreground text-sm sm:text-base">
          Manage your products, track conversions, and monitor affiliate links.
        </p>
      </div>

      {/* Stats & Quick Actions */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {/* Total Products Card */}
        <Card className="shadow-sm border border-border">
          <CardHeader className="pb-2">
            <CardDescription className="font-medium text-muted-foreground">Total Products</CardDescription>
            <CardTitle className="text-3xl font-semibold">
              {loading ? "—" : stats?.totalProducts ?? 0}
            </CardTitle>
          </CardHeader>
        </Card>

        {/* Quick Actions Card */}
        <Card className="shadow-sm border border-border">
          <CardHeader className="pb-2">
            <CardDescription className="font-medium">Quick Actions</CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            <Link href="/admin/products/new" className="block w-full">
              <Button size="default" className="w-full shadow-sm">
                <Plus className="mr-2 h-4 w-4" />
                New Product
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Storefront Link Card */}
        <Card className="shadow-sm border border-border sm:col-span-2 lg:col-span-1">
          <CardHeader className="pb-2">
            <CardDescription className="font-medium">View Store</CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            <Link href="/products" className="block w-full">
              <Button size="default" variant="outline" className="w-full">
                Open Storefront
                <ExternalLink className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Getting started */}
      <Card className="shadow-sm border border-border">
        <CardHeader>
          <CardTitle className="text-lg">Getting Started</CardTitle>
          <CardDescription>Follow these steps to set up your first product.</CardDescription>
        </CardHeader>
        <CardContent>
          <ol className="space-y-4 text-sm text-muted-foreground">
            <li className="flex gap-4">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-secondary text-secondary-foreground text-xs font-semibold">
                1
              </span>
              <div className="flex flex-col justify-center min-w-0">
                <span className="font-medium text-foreground">Create a product</span>
                <span className="truncate break-words whitespace-normal text-muted-foreground">Add a title, description, and select a category.</span>
              </div>
            </li>
            <li className="flex gap-4">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-secondary text-secondary-foreground text-xs font-semibold">
                2
              </span>
              <div className="flex flex-col justify-center min-w-0">
                <span className="font-medium text-foreground">Upload images</span>
                <span className="truncate break-words whitespace-normal text-muted-foreground">Upload product photos (auto-optimized to WebP).</span>
              </div>
            </li>
            <li className="flex gap-4">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-secondary text-secondary-foreground text-xs font-semibold">
                3
              </span>
              <div className="flex flex-col justify-center min-w-0">
                <span className="font-medium text-foreground">Add merchant links</span>
                <span className="truncate break-words whitespace-normal text-muted-foreground">Connect Shopee, Lazada, or TikTok Shop links.</span>
              </div>
            </li>
            <li className="flex gap-4">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-secondary text-secondary-foreground text-xs font-semibold">
                4
              </span>
              <div className="flex flex-col justify-center min-w-0">
                <span className="font-medium text-foreground">Add variants</span>
                <span className="truncate break-words whitespace-normal text-muted-foreground">Specify size, color, or other options with exact prices.</span>
              </div>
            </li>
            <li className="flex gap-4">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-secondary text-secondary-foreground text-xs font-semibold">
                5
              </span>
              <div className="flex flex-col justify-center min-w-0">
                <span className="font-medium text-foreground">Go live</span>
                <span className="truncate break-words whitespace-normal text-muted-foreground">Verify the data and your product is live on the storefront!</span>
              </div>
            </li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}
