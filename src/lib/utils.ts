import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import matter from "gray-matter"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export interface BlogPostMeta {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  category?: string;
  readTime?: string;
}

export function parseMarkdownFile(content: string, slug: string): BlogPostMeta & { content: string } {
  const { data, content: mdContent } = matter(content);
  return {
    slug,
    title: data.title || slug,
    date: data.date || '',
    excerpt: data.excerpt || '',
    category: data.category || '',
    readTime: data.readTime || '',
    content: mdContent,
  };
}
