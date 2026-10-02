import { createFileRoute } from '@tanstack/react-router';
import { scopeSearchSchema } from '@/features/households/scope-search';
import { CatalogPage } from '@/features/catalog/catalog-page';

export const Route = createFileRoute('/_authenticated/catalog/')({
  validateSearch: scopeSearchSchema,
  component: CatalogPage,
});
