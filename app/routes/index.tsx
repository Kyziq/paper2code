import { createFileRoute, useRouter } from "@tanstack/react-router";
import { getPosts } from "~/utils/posts";

export const Route = createFileRoute("/")({
	component: Home,
	loader: async () => await getPosts(),
});

function Home() {
	const router = useRouter();
	const posts = Route.useLoaderData();

	return (
		<div>
			<h1 className="text-2xl mb-4">Posts from JSONPlaceholder</h1>
			<ul className="space-y-4">
				{posts.map((post) => (
					<li key={post.id} className="border p-4 rounded">
						<h2 className="text-xl font-bold">{post.title}</h2>
						<p>{post.body}</p>
					</li>
				))}
			</ul>
		</div>
	);
}
