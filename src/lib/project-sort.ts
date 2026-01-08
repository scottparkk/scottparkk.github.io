// Utility for consistent project ordering logic.
// Priority rules:
// 1. featured (true) come first
// 2. explicit order (lower numeric values first; undefined treated as +Infinity)
// 3. year desc
// 4. title asc (stable tie-breaker)

import type { CollectionEntry } from 'astro:content';

type ProjectEntry = CollectionEntry<'projects'>;

export function sortProjects(entries: ProjectEntry[]): ProjectEntry[] {
  return [...entries].sort((a, b) => {
    const af = a.data.featured ? 0 : 1;
    const bf = b.data.featured ? 0 : 1;
    if (af !== bf) return af - bf;

    const ao = a.data.order ?? Number.POSITIVE_INFINITY;
    const bo = b.data.order ?? Number.POSITIVE_INFINITY;
    if (ao !== bo) return ao - bo;

    if (a.data.year !== b.data.year) return b.data.year - a.data.year;

    return a.data.title.localeCompare(b.data.title);
  });
}

export function groupByType(entries: ProjectEntry[]) {
  return {
    creative: entries.filter(e => e.data.type === 'creative'),
    technical: entries.filter(e => e.data.type === 'technical'),
  };
}
