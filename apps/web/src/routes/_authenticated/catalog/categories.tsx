import { createFileRoute } from '@tanstack/react-router';
import { CategoriesPage } from '@/features/categories/categories-page';

export const Route = createFileRoute('/_authenticated/catalog/categories')({
  component: CategoriesPage,
});
