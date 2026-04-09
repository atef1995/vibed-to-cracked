import { BlogService } from "@/lib/blogService";
import BlogPageClient from "./BlogPageClient";

export default async function BlogPage() {
  let initialPosts = [];
  let initialFeatured = [];
  let initialCategories = [];
  let totalCount = 0;
  let totalPages = 1;

  try {
    const [posts, featured, categories, count] = await Promise.all([
      BlogService.getAllPosts(9, 0),
      BlogService.getFeaturedPosts(3),
      BlogService.getCategoriesWithCounts(),
      BlogService.getPostsCount(),
    ]);

    initialPosts = JSON.parse(JSON.stringify(posts));
    initialFeatured = JSON.parse(JSON.stringify(featured));
    initialCategories = JSON.parse(JSON.stringify(categories));
    totalCount = count;
    totalPages = Math.ceil(count / 9);
  } catch (error) {
    console.error("Failed to fetch blog data for SSR:", error);
  }

  return (
    <BlogPageClient
      initialPosts={initialPosts}
      initialFeatured={initialFeatured}
      initialCategories={initialCategories}
      initialTotalPages={totalPages}
      initialTotalCount={totalCount}
    />
  );
}
