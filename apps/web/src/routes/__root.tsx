import {
	Link,
	Outlet,
	createRootRouteWithContext,
	useNavigate,
} from "@tanstack/react-router";
import { ModeToggle } from "~/components/mode-toggle";
import { ThemeProvider } from "~/components/theme-provider";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";

import { CodeSquare, LogOut } from "lucide-react";
import { toast } from "sonner";
import { useAuthStore } from "~/stores/useAuthStore";
import type { GoogleUser } from "~shared/types/auth";

export interface RouterContext {
	auth: {
		user: GoogleUser | null;
		isAuthenticated: boolean;
	};
}

export const Route = createRootRouteWithContext<RouterContext>()({
	component: RootComponent,
});

function RootComponent() {
	const { user, isAuthenticated, logout } = useAuthStore();

	const navigate = useNavigate();

	const handleLogout = () => {
		logout();
		toast.success("Logged out successfully");
		navigate({
			to: "/",
		});
	};

	return (
		<ThemeProvider>
			<div className="min-h-screen flex flex-col">
				{/* Main background - subtle gradient */}
				<div className="fixed inset-0 bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-950 dark:to-blue-950 -z-10" />

				{/* Header */}
				<header className="relative bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 dark:from-slate-800 dark:via-blue-800 dark:to-slate-800 shadow-lg">
					<div className="absolute inset-0 bg-gradient-to-b from-white/[0.03] to-transparent" />
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

							<div className="flex items-center gap-3">
								<ModeToggle />

								{isAuthenticated && user && (
									<DropdownMenu>
										<DropdownMenuTrigger className="focus:outline-none">
											<Avatar className="h-9 w-9 transition-transform hover:scale-105">
												<AvatarImage
													src={user.picture}
													alt={user.name}
													referrerPolicy="no-referrer"
												/>
												<AvatarFallback className="bg-blue-600 text-white">
													{user.name?.charAt(0).toUpperCase()}
												</AvatarFallback>
											</Avatar>
										</DropdownMenuTrigger>
										<DropdownMenuContent align="end" className="w-56">
											<DropdownMenuLabel>
												<div className="flex flex-col space-y-1">
													<p className="text-sm font-medium leading-none">
														{user.name}
													</p>
													<p className="text-xs leading-none text-muted-foreground">
														{user.email}
													</p>
												</div>
											</DropdownMenuLabel>
											<DropdownMenuSeparator />
											<Link to="/app/snippets">
												<DropdownMenuItem className="cursor-pointer">
													<CodeSquare className="mr-2 h-4 w-4" />
													Code Snippets
												</DropdownMenuItem>
											</Link>
											<DropdownMenuSeparator />
											<DropdownMenuItem
												className="cursor-pointer text-red-600 dark:text-red-400 focus:text-red-700 dark:focus:text-red-300"
												onClick={handleLogout}
											>
												<LogOut className="mr-2 h-4 w-4" />
												Log out
											</DropdownMenuItem>
										</DropdownMenuContent>
									</DropdownMenu>
								)}
							</div>
						</div>
					</nav>
				</header>

				<Outlet />

				<div className="fixed inset-0 bg-gradient-to-t from-transparent via-transparent to-white/[0.02] dark:to-black/[0.02] pointer-events-none" />
			</div>
		</ThemeProvider>
	);
}
