"use client";

import { useEffect, useState } from "react";
import { api, ApiRequestError } from "@/lib/api";
import type { Conversion, ConversionStatus } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const STATUS_OPTIONS: ConversionStatus[] = ["pending", "approved", "rejected", "cancelled"];

const STATUS_COLORS: Record<ConversionStatus, string> = {
  pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  approved: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  rejected: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  cancelled: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200",
};

export default function ConversionsPage() {
  const [conversions, setConversions] = useState<Conversion[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [platformFilter, setPlatformFilter] = useState<string>("");

  // Action states
  const [acting, setActing] = useState<string | null>(null);

  const fetchConversions = async () => {
    try {
      setLoading(true);
      const params: Record<string, string | number> = { page, limit: 20 };
      if (statusFilter) params.status = statusFilter;
      if (platformFilter) params.platform = platformFilter;

      const res = await api.getConversions(params);
      setConversions(res.items);
      setTotal(res.total);
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Failed to load conversions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConversions();
  }, [page, statusFilter, platformFilter]);

  const handleApprove = async (id: string) => {
    try {
      setActing(id);
      await api.approveConversion(id);
      fetchConversions();
    } catch (err) {
      alert(err instanceof ApiRequestError ? err.message : "Failed to approve");
    } finally {
      setActing(null);
    }
  };

  const handleReject = async (id: string) => {
    try {
      setActing(id);
      await api.rejectConversion(id);
      fetchConversions();
    } catch (err) {
      alert(err instanceof ApiRequestError ? err.message : "Failed to reject");
    } finally {
      setActing(null);
    }
  };

  const formatCurrency = (amount: number | null, currency: string) => {
    if (amount === null) return "—";
    return new Intl.NumberFormat("th-TH", {
      style: "currency",
      currency: currency,
    }).format(amount);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("th-TH", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (error) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-destructive">{error}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Conversions</h1>
        <div className="text-sm text-muted-foreground">
          {total} total conversions
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
          className="rounded-md border bg-background px-3 py-2 text-sm"
        >
          <option value="">All Status</option>
          {STATUS_OPTIONS.map((status) => (
            <option key={status} value={status}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </option>
          ))}
        </select>

        <select
          value={platformFilter}
          onChange={(e) => {
            setPlatformFilter(e.target.value);
            setPage(1);
          }}
          className="rounded-md border bg-background px-3 py-2 text-sm"
        >
          <option value="">All Platforms</option>
          <option value="shopee">Shopee</option>
          <option value="lazada">Lazada</option>
          <option value="tiktok">TikTok</option>
          <option value="other">Other</option>
        </select>
      </div>

      {/* Conversions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Conversion History</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-8 text-center text-muted-foreground">Loading...</div>
          ) : conversions.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              No conversions found
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="pb-2 font-medium">Platform</th>
                    <th className="pb-2 font-medium">Order ID</th>
                    <th className="pb-2 font-medium">Amount</th>
                    <th className="pb-2 font-medium">Commission</th>
                    <th className="pb-2 font-medium">Status</th>
                    <th className="pb-2 font-medium">Type</th>
                    <th className="pb-2 font-medium">Date</th>
                    <th className="pb-2 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {conversions.map((conv) => (
                    <tr key={conv.id} className="border-b">
                      <td className="py-3">
                        <span className="capitalize">{conv.platform}</span>
                      </td>
                      <td className="py-3">
                        <span className="font-mono text-xs">
                          {conv.order_id || "—"}
                        </span>
                      </td>
                      <td className="py-3">
                        {formatCurrency(conv.order_amount, conv.currency)}
                      </td>
                      <td className="py-3">
                        {formatCurrency(conv.commission, conv.currency)}
                      </td>
                      <td className="py-3">
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${STATUS_COLORS[conv.status]}`}
                        >
                          {conv.status}
                        </span>
                      </td>
                      <td className="py-3">
                        <span className="capitalize">{conv.conversion_type}</span>
                      </td>
                      <td className="py-3 text-muted-foreground">
                        {formatDate(conv.created_at)}
                      </td>
                      <td className="py-3">
                        {conv.status === "pending" && (
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleApprove(conv.id)}
                              disabled={acting === conv.id}
                              className="text-green-600 hover:text-green-700"
                            >
                              Approve
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleReject(conv.id)}
                              disabled={acting === conv.id}
                              className="text-red-600 hover:text-red-700"
                            >
                              Reject
                            </Button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {total > 20 && (
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {page} of {Math.ceil(total / 20)}
          </span>
          <Button
            variant="outline"
            onClick={() => setPage((p) => p + 1)}
            disabled={page * 20 >= total}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
