"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { api, ApiRequestError } from "@/lib/api";
import type { ScrapeJobDetail, ScrapeJobStatus } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

const STATUS_COLORS: Record<ScrapeJobStatus, string> = {
  pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  running: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  completed: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  failed: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
};

export default function ScrapeJobDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [job, setJob] = useState<ScrapeJobDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const data = await api.getScrapeJob(params.id as string);
        setJob(data);
      } catch (err) {
        setError(err instanceof ApiRequestError ? err.message : "Failed to load job");
      } finally {
        setLoading(false);
      }
    };
    fetchJob();
  }, [params.id]);

  const formatDate = (date: string | null) => {
    if (!date) return "-";
    return new Date(date).toLocaleString();
  };

  if (loading) {
    return <div className="text-center py-8 text-muted-foreground">Loading...</div>;
  }

  if (error) {
    return (
      <div className="space-y-4">
        <Card className="border-destructive">
          <CardContent className="p-4 text-destructive">{error}</CardContent>
        </Card>
        <Button variant="outline" onClick={() => router.back()}>
          Back
        </Button>
      </div>
    );
  }

  if (!job) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Scrape Job Details</h1>
          <p className="text-muted-foreground">{job.id}</p>
        </div>
        <Button variant="outline" onClick={() => router.back()}>
          Back
        </Button>
      </div>

      {/* Job Info */}
      <Card>
        <CardHeader>
          <CardTitle>Job Information</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="text-sm font-medium text-muted-foreground">Status</label>
            <div className="mt-1">
              <span className={`text-xs px-2 py-1 rounded-full ${STATUS_COLORS[job.status]}`}>
                {job.status}
              </span>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">Source</label>
            <div className="mt-1">
              <Link
                href="/admin/scrape-sources"
                className="text-primary hover:underline"
              >
                {job.source_name}
              </Link>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">Created</label>
            <div className="mt-1">{formatDate(job.created_at)}</div>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">Started</label>
            <div className="mt-1">{formatDate(job.started_at)}</div>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">Completed</label>
            <div className="mt-1">{formatDate(job.completed_at)}</div>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">Items Found</label>
            <div className="mt-1">{job.items_found}</div>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">Items Ingested</label>
            <div className="mt-1">{job.items_ingested}</div>
          </div>
          {job.error_message && (
            <div className="sm:col-span-2">
              <label className="text-sm font-medium text-destructive">Error</label>
              <div className="mt-1 text-destructive">{job.error_message}</div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results */}
      <Card>
        <CardHeader>
          <CardTitle>Results ({job.results.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {job.results.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">
              No results yet. The job may still be running.
            </p>
          ) : (
            <div className="space-y-4">
              {job.results.map((result) => (
                <div
                  key={result.id}
                  className="border rounded-lg p-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">
                          {result.id.slice(0, 8)}...
                        </span>
                        {result.ingested_at && (
                          <span className="text-xs px-2 py-0.5 rounded bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                            Ingested
                          </span>
                        )}
                      </div>
                      {result.product_id && (
                        <p className="text-sm mt-1">
                          Product ID: {result.product_id.slice(0, 8)}...
                        </p>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {formatDate(result.created_at)}
                    </div>
                  </div>
                  <details className="mt-2">
                    <summary className="text-sm cursor-pointer text-muted-foreground hover:text-foreground">
                      View raw data
                    </summary>
                    <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-x-auto">
                      {JSON.stringify(result.raw_data, null, 2)}
                    </pre>
                  </details>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
