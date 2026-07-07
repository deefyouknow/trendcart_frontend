"use client";

import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { ProductForm } from "@/components/admin/product-form";

export default function NewProductPage() {
  const router = useRouter();

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">New Product</h1>
        <p className="text-sm text-muted-foreground">
          Create a new product to start adding merchant links.
        </p>
      </div>
      <ProductForm
        submitLabel="Create Product"
        onSubmit={async (data) => {
          const product = await api.createProduct(data);
          router.push(`/admin/products/${product.id}/edit`);
        }}
      />
    </div>
  );
}
