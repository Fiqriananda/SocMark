import { Suspense } from "react";
import ProductDetailClient from "./ProductDetailClient";

export default function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense fallback={<main className="detail-route-loading">Loading product...</main>}>
      <ProductDetailClient params={params} />
    </Suspense>
  );
}
