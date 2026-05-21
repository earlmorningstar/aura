import { MarketingNav } from "../marketing-client";
import { createMetadata } from "@/lib/metadata";

export const metadata = createMetadata({
  title: "Blog · Aura",
  description: "Tips, stories, and insights for creators and solopreneurs.",
  path: "/blog",
});

const posts = [
  { title: "How to turn one video into $10k", date: "Apr 28, 2026" },
  { title: "Why your newsletter is your most valuable asset", date: "Apr 14, 2026" },
  { title: "The 3 analytics every creator should track", date: "Mar 30, 2026" },
];

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-[var(--color-bg-void)] text-white">
      <MarketingNav />
      <div className="mx-auto max-w-3xl px-6 py-10">
        <h1 className="font-display text-3.5xl font-bold mb-8 leading-normal">Blog</h1>
        <p className="text-lg text-white/60 mb-12">
          Stories and insights for creators building independent businesses.
        </p>
        <div className="space-y-8">
          {posts.map((post) => (
            <article
              key={post.title}
              className="rounded-2xl border border-white/5 bg-white/5 p-6 backdrop-blur hover:bg-white/[0.07] transition-colors"
            >
              <h2 className="font-semibold text-xl mb-1">{post.title}</h2>
              <p className="text-sm text-white/40">{post.date}</p>
            </article>
          ))}
          <p className="text-center text-white/30 text-sm italic">
            More posts coming soon — stay tuned!
          </p>
        </div>
      </div>
    </div>
  );
}