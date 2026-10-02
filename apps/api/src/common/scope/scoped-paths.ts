// Routes of a scoped collection, for both scopes.
export function scopedPaths(collection: string): string[] {
  return [`scopes/personal/${collection}`, `scopes/households/:householdId/${collection}`];
}
