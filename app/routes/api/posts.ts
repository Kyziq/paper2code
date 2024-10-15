import { json } from '@tanstack/start'
import { createAPIFileRoute } from '@tanstack/start/api'

export const Route = createAPIFileRoute('/api/posts')({
  GET: async ({ request, params }) => {
    try {
      const response = await fetch('https://jsonplaceholder.typicode.com/posts')

      if (!response.ok) {
        throw new Error('Failed to fetch posts')
      }

      const posts = await response.json()
      return json(posts)
    } catch (error) {
      return new Response('Error fetching posts', {
        status: 500,
      })
    }
  },
})
