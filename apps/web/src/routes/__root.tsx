import { Link, Outlet, createRootRoute } from "@tanstack/react-router";
import { ModeToggle } from "~/components/mode-toggle";
import { ThemeProvider } from "~/components/theme-provider";

export const Route = createRootRoute({
	component: () => (
		<ThemeProvider>
			<div className="min-h-screen flex flex-col">
				{/* Main background - subtle gradient */}
				<div className="fixed inset-0 bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-950 dark:to-blue-950 -z-10" />

				{/* Header with rich gradient */}
				<header className="relative bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 dark:from-slate-800 dark:via-blue-800 dark:to-slate-800 shadow-lg">
					{/* Subtle gradient overlay */}
					<div className="absolute inset-0 bg-gradient-to-b from-white/[0.03] to-transparent" />

					{/* Navigation content */}
					<nav className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
						<div className="flex justify-between items-center h-16">
							<div className="flex items-center">
								<Link
									to="/"
									className="flex-shrink-0 transition-transform hover:scale-[1.02]"
								>
									<h3 className="text-lg font-semibold text-white">
										paper2code
									</h3>
								</Link>
							</div>
							<div className="flex items-center">
								<ModeToggle />
							</div>
						</div>
					</nav>
				</header>

				{/* Main content */}
				<main className="flex-grow relative">
					<Outlet />
				</main>

				{/* Subtle gradient overlay for depth */}
				<div className="fixed inset-0 bg-gradient-to-t from-transparent via-transparent to-white/[0.02] dark:to-black/[0.02] pointer-events-none" />
			</div>
		</ThemeProvider>
	),
});
