import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import {
  type CategoryDto,
  categoryListSchema,
  type CreateEntryInput,
  type CreateItemInput,
  type CreateListInput,
  type EntryDto,
  entrySchema,
  type ItemDto,
  itemSchema,
  type ListDto,
  listSchema,
  type PurchaseRecordDto,
  purchaseRecordSchema,
} from '@shoppy/shared';
import type { z } from 'zod';
import { bearer } from './auth-fixtures.js';

type Method = 'GET' | 'POST' | 'PATCH' | 'DELETE';

interface Caller {
  accessToken: string;
}

interface InjectedResponse {
  statusCode: number;
  body: string;
  json: () => unknown;
}

export function apiAs(app: NestFastifyApplication, user: Caller) {
  return (method: Method, url: string, payload?: object) =>
    app.inject({
      method,
      url: `/api${url}`,
      headers: bearer(user.accessToken),
      ...(payload && { payload }),
    });
}

export function parseOk<S extends z.ZodType>(res: InjectedResponse, schema: S): z.output<S> {
  if (res.statusCode >= 300) throw new Error(`Request failed with ${res.statusCode}: ${res.body}`);
  return schema.parse(res.json());
}

export async function listCategories(
  app: NestFastifyApplication,
  user: Caller,
): Promise<CategoryDto[]> {
  return parseOk(await apiAs(app, user)('GET', '/scopes/personal/categories'), categoryListSchema);
}

export async function createItem(
  app: NestFastifyApplication,
  user: Caller,
  input: CreateItemInput,
): Promise<ItemDto> {
  return parseOk(await apiAs(app, user)('POST', '/scopes/personal/items', input), itemSchema);
}

export async function createList(
  app: NestFastifyApplication,
  user: Caller,
  input: CreateListInput = { name: 'Groceries', icon: 'shopping-cart' },
): Promise<ListDto> {
  return parseOk(await apiAs(app, user)('POST', '/scopes/personal/lists', input), listSchema);
}

export async function addEntry(
  app: NestFastifyApplication,
  user: Caller,
  listId: string,
  input: CreateEntryInput,
): Promise<EntryDto> {
  return parseOk(await apiAs(app, user)('POST', `/lists/${listId}/entries`, input), entrySchema);
}

export async function checkEntry(
  app: NestFastifyApplication,
  user: Caller,
  entryId: string,
): Promise<PurchaseRecordDto> {
  return parseOk(await apiAs(app, user)('POST', `/entries/${entryId}/check`), purchaseRecordSchema);
}

export async function archiveList(
  app: NestFastifyApplication,
  user: Caller,
  listId: string,
): Promise<void> {
  parseOk(await apiAs(app, user)('PATCH', `/lists/${listId}`, { isArchived: true }), listSchema);
}
