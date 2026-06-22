import { BlogPublisher } from './blog-publisher'
import { GitHubSyncObserver } from './github-sync'

// Singleton publisher - import this in API routes
const blogPublisher = new BlogPublisher()

// Register observers only when env vars are present (avoids errors in dev without config)
if (process.env.GITHUB_TOKEN && process.env.GITHUB_OWNER && process.env.GITHUB_REPO) {
  blogPublisher.subscribe(new GitHubSyncObserver())
}

export { blogPublisher }
export type { BlogEvent, BlogPostData, BlogObserver } from './blog-publisher'
