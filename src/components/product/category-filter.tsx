"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Category } from "@/lib/types";

interface CategoryFilterProps {
  categories: Category[];
  selected?: string;
  className?: string;
}

export function CategoryFilter({
  categories,
  selected,
  className,
}: CategoryFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleSelect = (category: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (category) {
      params.set("category", category);
    } else {
      params.delete("category");
    }
    router.push(`/products?${params.toString()}`);
  };

  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      <Button
        variant={selected ? "secondary" : "outline"}
        size="sm"
        onClick={() => handleSelect(null)}
      >
        ทั้งหมด
      </Button>
      {categories?.map((cat) => (
        <Button
          key={cat.name}
          variant={selected === cat.name ? "default" : "outline"}
          size="sm"
          onClick={() => handleSelect(cat.name)}
          className="gap-1.5"
        >
          {cat.name}
          <Badge variant="secondary" className="ml-1 text-[10px]">
            {cat.product_count}
          </Badge>
        </Button>
      ))}
    </div>
  );
}
