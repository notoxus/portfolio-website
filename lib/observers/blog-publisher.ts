export type BlogEvent = 'POST_CREATED' | 'POST_UPDATED' | 'POST_DELETED'

export interface BlogPostData {
  slug: string
  content: string
  metadata: {
    title: string
    publishedAt: string
    summary: string
    category?: string
    image?: string
    language?: 'vi' | 'en'
  }
}

export interface BlogObserver {
  name: string
  update(event: BlogEvent, post: BlogPostData): Promise<void>
}

// Subject in Observer pattern
export class BlogPublisher {
  private observers: BlogObserver[] = []

  subscribe(observer: BlogObserver) {
    if (!this.observers.find(o => o.name === observer.name)) {
      this.observers.push(observer)
    }
  }

  unsubscribe(name: string) {
    this.observers = this.observers.filter(o => o.name !== name)
  }

  getObservers() {
    return this.observers.map(o => o.name)
  }

  async notify(event: BlogEvent, post: BlogPostData): Promise<{ observer: string; ok: boolean; error?: string }[]> {
    const results = await Promise.allSettled(
      this.observers.map(o => o.update(event, post).then(() => ({ observer: o.name, ok: true })))
    )
    return results.map((r, i) =>
      r.status === 'fulfilled'
        ? r.value
        : { observer: this.observers[i].name, ok: false, error: String((r as any).reason) }
    )
  }
}
