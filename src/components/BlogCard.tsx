import type { BlogPost } from "../lib/blogPosts";

type BlogCardProps = {
  post: BlogPost;
  featured?: boolean;
};

/** Deterministic href for a blog card — exported for unit tests. */
export function blogCardHref(post: Pick<BlogPost, "slug">): string {
  return post.slug === "Who-Owns-Weddings.io" ? `/${post.slug}` : `/blog/${post.slug}/`;
}

export function BlogCard({ post, featured = false }: BlogCardProps) {
  const href = blogCardHref(post);

  return (
    <a
      href={href}
      className="group flex h-full flex-col overflow-hidden rounded-lg border border-border bg-card shadow-sm transition duration-300 hover:-translate-y-1 hover:border-primary/70"
    >


      <div className="relative aspect-[16/9] overflow-hidden bg-muted">
        {featured && (
          <span className="absolute left-4 top-4 z-10 rounded-full bg-primary px-3 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-primary-foreground">
            Featured
          </span>
        )}
        <img src={post.image} alt={post.imageAlt ?? post.title} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" loading={featured ? "eager" : "lazy"} />
      </div>
      <div className="flex flex-1 flex-col p-6">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.24em] text-primary">{post.dateLabel}</p>
        <h2 className="mb-3 font-serif text-xl leading-snug text-card-foreground">{post.title}</h2>
        <p className="mb-5 line-clamp-4 flex-1 text-sm leading-7 text-muted-foreground">{post.excerpt}</p>
        <span className="text-sm font-medium text-primary">Read Article →</span>
      </div>
    </a>
  );
}
