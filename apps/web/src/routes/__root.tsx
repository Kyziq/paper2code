import { Link, Outlet, createRootRoute } from "@tanstack/react-router";

export const Route = createRootRoute({
	component: () => (
		<div className="flex flex-col min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
			<header className="bg-white shadow-sm">
				<nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="flex justify-between h-16">
						<div className="flex">
							<Link to="/" className="flex-shrink-0 flex items-center">
								<span className="text-lg font-semibold text-gray-900">
									paper2code
								</span>
							</Link>
						</div>
					</div>
				</nav>
			</header>
			<main className="flex-grow">
				<Outlet />
			</main>
		</div>
	),
});
