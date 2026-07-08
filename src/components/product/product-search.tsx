"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function ProductSearch() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentSearch = searchParams.get("search") || "";
  const [searchInput, setSearchInput] = useState(currentSearch);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    if (searchInput) {
      params.set("search", searchInput);
    } else {
      params.delete("search");
    }
    // Reset to page 1 on new search
    params.delete("page");
    router.push(`/products?${params.toString()}`);
  };

  const handleClear = () => {
    setSearchInput("");
    const params = new URLSearchParams(searchParams.toString());
    params.delete("search");
    params.delete("page");
    router.push(`/products?${params.toString()}`);
  };

  return (
    <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2 w-full sm:max-w-md">
      <Input
        type="search"
        placeholder="ค้นหาสินค้า..."
        value={searchInput}
        onChange={(e) => setSearchInput(e.target.value)}
        className="w-full"
      />
      <div className="flex gap-2">
        <Button type="submit" size="sm" className="flex-1 sm:flex-none">
          ค้นหา
        </Button>
        {currentSearch && (
          <Button type="button" variant="ghost" size="sm" onClick={handleClear} className="flex-1 sm:flex-none">
            ล้าง
          </Button>
        )}
      </div>
    </form>
  );
}
