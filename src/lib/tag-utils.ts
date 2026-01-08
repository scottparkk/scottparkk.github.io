import type { CollectionEntry } from 'astro:content';

export function extractProjectTags(projects: CollectionEntry<'projects'>[]) {
  const set = new Set<string>();
  projects.forEach(p => p.data.tags?.forEach(t => set.add(t)));
  return Array.from(set).sort();
}

export function extractBlogTags(posts: CollectionEntry<'blog'>[]) {
  const set = new Set<string>();
  posts.forEach(p => p.data.tags?.forEach(t => set.add(t)));
  return Array.from(set).sort();
}

export function filterProjectsByTags(projects: CollectionEntry<'projects'>[], active: string[]) {
  if (active.length === 0) return projects;
  return projects.filter(p => {
    const tags = p.data.tags || [];
    return active.every(a => tags.includes(a));
  });
}
