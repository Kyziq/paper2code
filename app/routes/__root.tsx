import { Link, createRootRoute } from "@tanstack/react-router";
import { Outlet, ScrollRestoration } from "@tanstack/react-router";
import { Body, Head, Html, Meta, Scripts } from "@tanstack/start";
import type * as React from "react";
import { NotFound } from "~/components/NotFound";
import "~/styles/app.css";

export const Route = createRootRoute({
	meta: () => [
		{
			charSet: "utf-8",
		},
		{
			name: "viewport",
			content: "width=device-width, initial-scale=1",
		},
		{
			title: "paper2code",
		},
	],
	notFoundComponent: () => <NotFound />,
	component: RootComponent,
});

function RootComponent() {
	return (
		<RootDocument>
			<Outlet />
		</RootDocument>
	);
}

function RootDocument({ children }: { children: React.ReactNode }) {
	return (
		<Html>
			<Head>
				<Meta />
			</Head>
			<Body>
				<div className="p-2 flex gap-2 text-lg font-bold">
					<Link to="/" activeProps={{}} activeOptions={{ exact: true }}>
						paper2code
					</Link>
				</div>
				<hr />
				{children}
				<ScrollRestoration />
				<Scripts />
			</Body>
		</Html>
	);
}
