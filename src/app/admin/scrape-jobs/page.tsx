"use client";

import { useEffect, useState } from "react";
import { api, ApiRequestError } from "@/lib/api";
import { formatDateTime } from "@/lib/utils";
import type { ScrapeJob } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { Pagination } from "@/components/ui/pagination";
import { StatusBadge } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorBanner } from "@/components/ui/error-banner";
import { ITEMS_PER_PAGE } from "@/lib/constants";
import Link from "next/link";

export default function ScrapeJobsPage() {
  const [jobs, setJobs] = useState<ScrapeJob[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("");

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const params: Record<string, string | number> = { page, limit: ITEMS_PER_PAGE };
      if (statusFilter) params.status = statusFilter;
      const res = await api.getScrapeJobs(params);
      setJobs(res.items);
      setTotal(res.total);
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Failed to load jobs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [page, statusFilter]);

  return (
    <div className="space-y-6">
      <PageHeader title="Scrape Jobs" description="View history of scraping jobs" />

      {/* Filters */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">Filter by status:</span>
        {["", "pending", "running", "completed", "failed"].map((status) => (
          <Button
            key={status}
            variant={statusFilter === status ? "default" : "outline"}
            size="sm"
            onClick={() => { setStatusFilter(status); setPage(1); }}
          >
            {status || "All"}
          </Button>
        ))}
      </div>

      {error && <ErrorBanner message={error} />}

      {loading ? (
        <div className="text-center py-8 text-muted-foreground">Loading...</div>
      ) : jobs.length === 0 ? (
        <EmptyState message="No scrape jobs found. Trigger a job from the Scrape Sources page." />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-muted-foreground">
                <th className="pb-2 font-medium">Status</th>
                <th className="pb-2 font-medium">Source ID</th>
                <th className="pb-2 font-medium">Created</th>
                <th className="pb-2 font-medium">Started</th>
                <th className="pb-2 font-medium">Completed</th>
                <th className="pb-2 font-medium text-right">Found</th>
                <th className="pb-2 font-medium text-right">Ingested</th>
                <th className="pb-2 font-medium">Error</th>
              </tr>
            </thead>
            <tbody>
              {jobs.map((job) => (
                <tr key={job.id} className="border-b hover:bg-muted/50">
                  <td className="py-3"><StatusBadge status={job.status} /></td>
                  <td className="py-3">
                    <Link
                      href={`/admin/scrape-jobs/${job.id}`}
                      className="text-primary hover:underline"
                    >
                      {job.source_id.slice(0, 8)}...
                    </Link>
                  </td>
                  <td className="py-3 text-muted-foreground">{formatDateTime(job.created_at)}</td>
                  <td className="py-3 text-muted-foreground">{formatDateTime(job.started_at)}</td>
                  <td className="py-3 text-muted-foreground">{formatDateTime(job.completed_at)}</td>
                  <td className="py-3 text-right">{job.items_found}</td>
                  <td className="py-3 text-right">{job.items_ingested}</td>
                  <td className="py-3 text-destructive max-w-[200px] truncate">
                    {job.error_message || "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Pagination page={page} total={total} limit={ITEMS_PER_PAGE} onPageChange={setPage} />
    </div>
  );
}
