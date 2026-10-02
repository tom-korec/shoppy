import { createFileRoute } from '@tanstack/react-router';
import { scopeSearchSchema } from '@/features/households/scope-search';
import { CategoriesPage } from '@/features/categories/categories-page';

export const Route = createFileRoute('/_authenticated/catalog/categories')({
  validateSearch: scopeSearchSchema,
  component: CategoriesPage,
});
