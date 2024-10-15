import { createServerFn } from "@tanstack/start";

type PostType = {
	id: string;
	title: string;
	body: string;
};

export const getPosts = createServerFn("GET", async (): Promise<PostType[]> => {
	const response = await fetch("https://jsonplaceholder.typicode.com/posts");
	if (!response.ok) {
		throw new Error("Failed to fetch posts");
	}
	return response.json();
});
