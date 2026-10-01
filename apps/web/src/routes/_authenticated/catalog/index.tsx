import { createFileRoute } from '@tanstack/react-router';
import { CatalogPage } from '@/features/catalog/catalog-page';

export const Route = createFileRoute('/_authenticated/catalog/')({
  component: CatalogPage,
});
