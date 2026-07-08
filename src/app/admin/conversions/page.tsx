"use client";

import { useEffect, useState } from "react";
import { api, ApiRequestError } from "@/lib/api";
import { formatDateTime } from "@/lib/utils";
import type { Conversion, ConversionStatus } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { Pagination } from "@/components/ui/pagination";
import { StatusBadge } from "@/components/ui/status-badge";
import { ErrorBanner } from "@/components/ui/error-banner";
import { ITEMS_PER_PAGE } from "@/lib/constants";

const STATUS_OPTIONS: ConversionStatus[] = ["pending", "approved", "rejected", "cancelled"];

export default function ConversionsPage() {
  const [conversions, setConversions] = useState<Conversion[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [statusFilter, setStatusFilter] = useState<string>("");
  const [platformFilter, setPlatformFilter] = useState<string>("");
  const [acting, setActing] = useState<string | null>(null);

  const fetchConversions = async () => {
    try {
      setLoading(true);
      const params: Record<string, string | number> = { page, limit: ITEMS_PER_PAGE };
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
    return new Intl.NumberFormat("th-TH", { style: "currency", currency }).format(amount);
  };

  if (error) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <ErrorBanner message={error} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Conversions" description={`${total} total conversions`} />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
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
          onChange={(e) => { setPlatformFilter(e.target.value); setPage(1); }}
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
                        <span className="font-mono text-xs">{conv.order_id || "—"}</span>
                      </td>
                      <td className="py-3">{formatCurrency(conv.order_amount, conv.currency)}</td>
                      <td className="py-3">{formatCurrency(conv.commission, conv.currency)}</td>
                      <td className="py-3"><StatusBadge status={conv.status} /></td>
                      <td className="py-3">
                        <span className="capitalize">{conv.conversion_type}</span>
                      </td>
                      <td className="py-3 text-muted-foreground">
                        {formatDateTime(conv.created_at)}
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

      <Pagination page={page} total={total} limit={ITEMS_PER_PAGE} onPageChange={setPage} />
    </div>
  );
}
