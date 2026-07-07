"use client";

import { useEffect, useState } from "react";
import { api, ApiRequestError } from "@/lib/api";
import type { ScrapeJob, ScrapeJobStatus } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";

const STATUS_COLORS: Record<ScrapeJobStatus, string> = {
  pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  running: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  completed: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  failed: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
};

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
      const params: Record<string, string | number> = { page, limit: 20 };
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

  const formatDate = (date: string | null) => {
    if (!date) return "-";
    return new Date(date).toLocaleString();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Scrape Jobs</h1>
        <p className="text-muted-foreground">View history of scraping jobs</p>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">Filter by status:</span>
        {["", "pending", "running", "completed", "failed"].map((status) => (
          <Button
            key={status}
            variant={statusFilter === status ? "default" : "outline"}
            size="sm"
            onClick={() => {
              setStatusFilter(status);
              setPage(1);
            }}
          >
            {status || "All"}
          </Button>
        ))}
      </div>

      {error && (
        <Card className="border-destructive">
          <CardContent className="p-4 text-destructive">{error}</CardContent>
        </Card>
      )}

      {loading ? (
        <div className="text-center py-8 text-muted-foreground">Loading...</div>
      ) : jobs.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            No scrape jobs found. Trigger a job from the Scrape Sources page.
          </CardContent>
        </Card>
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
                  <td className="py-3">
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${STATUS_COLORS[job.status]}`}
                    >
                      {job.status}
                    </span>
                  </td>
                  <td className="py-3">
                    <Link
                      href={`/admin/scrape-jobs/${job.id}`}
                      className="text-primary hover:underline"
                    >
                      {job.source_id.slice(0, 8)}...
                    </Link>
                  </td>
                  <td className="py-3 text-muted-foreground">
                    {formatDate(job.created_at)}
                  </td>
                  <td className="py-3 text-muted-foreground">
                    {formatDate(job.started_at)}
                  </td>
                  <td className="py-3 text-muted-foreground">
                    {formatDate(job.completed_at)}
                  </td>
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

      {/* Pagination */}
      {total > 20 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
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
            size="sm"
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
