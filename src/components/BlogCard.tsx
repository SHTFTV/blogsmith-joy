import type { BlogPost } from "../lib/blogPosts";
import { PostVote } from "./PostVote";

type BlogCardProps = {
  post: BlogPost;
  showVote?: boolean;
};

/** Deterministic href for a blog card — exported for unit tests. */
export function blogCardHref(post: Pick<BlogPost, "slug" | "externalUrl">): string {
  if (post.externalUrl) return post.externalUrl;
  return post.slug === "Who-Owns-Weddings.io" ? `/${post.slug}` : `/blog/${post.slug}/`;
}

export function BlogCard({ post, showVote = false }: BlogCardProps) {
  const href = blogCardHref(post);
  const external = Boolean(post.externalUrl);

  return (
    <a
      href={href}
      {...(external ? { rel: "noopener" } : {})}
      className="group flex h-full flex-col overflow-hidden rounded-lg border border-border bg-card shadow-sm transition duration-300 hover:-translate-y-1 hover:border-primary/70"
    >
      <div className="relative aspect-[16/9] overflow-hidden bg-muted">
        <img
          src={post.image}
          alt={post.imageAlt ?? post.title}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          loading="lazy"
        />
      </div>
      <div className="flex flex-1 flex-col p-6">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.24em] text-primary">{post.dateLabel}</p>
        <h2 className="mb-3 font-serif text-xl leading-snug text-card-foreground">{post.title}</h2>
        <p className="mb-5 line-clamp-4 flex-1 text-sm leading-7 text-muted-foreground">{post.excerpt}</p>
        <span className="text-sm font-medium text-primary">Read Article →</span>
        {showVote && <PostVote slug={post.slug} />}
      </div>
    </a>
  );
}
