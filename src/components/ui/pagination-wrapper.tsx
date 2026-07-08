"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Pagination } from "@/components/ui/pagination";

interface PaginationWrapperProps {
  page: number;
  total: number;
  limit: number;
}

export function PaginationWrapper({ page, total, limit }: PaginationWrapperProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(newPage));
    router.push(`?${params.toString()}`);
  };

  return <Pagination page={page} total={total} limit={limit} onPageChange={handlePageChange} />;
}
