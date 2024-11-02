import { Link, Outlet, createRootRoute } from "@tanstack/react-router";
import { ModeToggle } from "~/components/mode-toggle";
import { ThemeProvider } from "~/components/theme-provider";

export const Route = createRootRoute({
	component: () => (
		<ThemeProvider>
			<div className="flex flex-col min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
				<header className="shadow-sm">
					<nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
						<div className="flex justify-between items-center h-14">
							<div className="items-center">
								<Link to="/" className="flex-shrink-0">
									<h3 className="text-lg font-semibold">paper2code</h3>
								</Link>
							</div>
							<div className="items-center">
								<ModeToggle />
							</div>
						</div>
					</nav>
				</header>
				<main className="flex-grow">
					<Outlet />
				</main>
			</div>
		</ThemeProvider>
	),
});
