"use client";

import { useEffect, useState } from "react";
import { api, ApiRequestError } from "@/lib/api";
import type { ScrapeSource } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ScrapeSourcesPage() {
  const [sources, setSources] = useState<ScrapeSource[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingSource, setEditingSource] = useState<ScrapeSource | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    platform: "shopee",
    source_url: "",
    scrape_interval_hours: 24,
  });
  const [saving, setSaving] = useState(false);

  // Trigger state
  const [triggering, setTriggering] = useState<string | null>(null);

  const fetchSources = async () => {
    try {
      setLoading(true);
      const res = await api.getScrapeSources({ page, limit: 20 });
      setSources(res.items);
      setTotal(res.total);
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Failed to load sources");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSources();
  }, [page]);

  const handleCreate = () => {
    setEditingSource(null);
    setFormData({ name: "", platform: "shopee", source_url: "", scrape_interval_hours: 24 });
    setShowModal(true);
  };

  const handleEdit = (source: ScrapeSource) => {
    setEditingSource(source);
    setFormData({
      name: source.name,
      platform: source.platform,
      source_url: source.source_url,
      scrape_interval_hours: source.scrape_interval_hours,
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      if (editingSource) {
        await api.updateScrapeSource(editingSource.id, formData);
      } else {
        await api.createScrapeSource(formData);
      }
      setShowModal(false);
      fetchSources();
    } catch (err) {
      alert(err instanceof ApiRequestError ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this source?")) return;
    try {
      await api.deleteScrapeSource(id);
      fetchSources();
    } catch (err) {
      alert(err instanceof ApiRequestError ? err.message : "Failed to delete");
    }
  };

  const handleTrigger = async (sourceId: string) => {
    try {
      setTriggering(sourceId);
      await api.triggerScrapeJob(sourceId);
      alert("Scrape job triggered successfully!");
    } catch (err) {
      alert(err instanceof ApiRequestError ? err.message : "Failed to trigger job");
    } finally {
      setTriggering(null);
    }
  };

  const handleToggleActive = async (source: ScrapeSource) => {
    try {
      await api.updateScrapeSource(source.id, { is_active: !source.is_active });
      fetchSources();
    } catch (err) {
      alert(err instanceof ApiRequestError ? err.message : "Failed to update");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Scrape Sources</h1>
          <p className="text-muted-foreground">
            Manage data sources for automated scraping
          </p>
        </div>
        <Button onClick={handleCreate}>Add Source</Button>
      </div>

      {error && (
        <Card className="border-destructive">
          <CardContent className="p-4 text-destructive">{error}</CardContent>
        </Card>
      )}

      {loading ? (
        <div className="text-center py-8 text-muted-foreground">Loading...</div>
      ) : sources.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            No scrape sources configured yet. Click &quot;Add Source&quot; to get started.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {sources.map((source) => (
            <Card key={source.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium truncate">{source.name}</h3>
                      <span className="text-xs px-2 py-0.5 rounded bg-muted">
                        {source.platform}
                      </span>
                      {!source.is_active && (
                        <span className="text-xs px-2 py-0.5 rounded bg-muted text-muted-foreground">
                          Inactive
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground truncate mt-1">
                      {source.source_url}
                    </p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                      <span>Every {source.scrape_interval_hours}h</span>
                      {source.last_scraped_at && (
                        <span>
                          Last scraped: {new Date(source.last_scraped_at).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleTrigger(source.id)}
                      disabled={triggering === source.id}
                    >
                      {triggering === source.id ? "Running..." : "Trigger"}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleActive(source)}
                    >
                      {source.is_active ? "Disable" : "Enable"}
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(source)}>
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive"
                      onClick={() => handleDelete(source.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
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

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle>{editingSource ? "Edit Source" : "Add Source"}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full mt-1 px-3 py-2 border rounded-md bg-background"
                  placeholder="My Shopee Source"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Platform</label>
                <select
                  value={formData.platform}
                  onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                  className="w-full mt-1 px-3 py-2 border rounded-md bg-background"
                >
                  <option value="shopee">Shopee</option>
                  <option value="lazada">Lazada</option>
                  <option value="tiktok">TikTok</option>
                  <option value="rss">RSS Feed</option>
                  <option value="custom">Custom</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Source URL</label>
                <input
                  type="url"
                  value={formData.source_url}
                  onChange={(e) => setFormData({ ...formData, source_url: e.target.value })}
                  className="w-full mt-1 px-3 py-2 border rounded-md bg-background"
                  placeholder="https://..."
                />
              </div>
              <div>
                <label className="text-sm font-medium">Scrape Interval (hours)</label>
                <input
                  type="number"
                  value={formData.scrape_interval_hours}
                  onChange={(e) =>
                    setFormData({ ...formData, scrape_interval_hours: Number(e.target.value) })
                  }
                  className="w-full mt-1 px-3 py-2 border rounded-md bg-background"
                  min={1}
                  max={720}
                />
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setShowModal(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSave} disabled={saving}>
                  {saving ? "Saving..." : "Save"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
