import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import {
	Calendar,
	CheckCircle2,
	Clock,
	Copy,
	ExternalLink,
	EyeOff,
	Loader2,
	Search,
	Terminal,
	XCircle,
} from "lucide-react";
import React, { useState } from "react";
import { toast } from "sonner";
import { CodeBlock } from "~/components/code-block";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { ScrollArea } from "~/components/ui/scroll-area";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "~/components/ui/tooltip";

// Types
interface HistoryItem {
	id: string;
	language: "python" | "cpp" | "java";
	timestamp: string;
	code: string;
	output: string;
	fileUrl?: string;
	success: boolean;
}

export const Route = createFileRoute("/_auth/app/_app/history")({
	component: HistoryComponent,
});

function HistoryComponent() {
	// State
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedItem, setSelectedItem] = useState<HistoryItem | null>(null);

	// Mock data
	const mockHistory: HistoryItem[] = [
		{
			id: "1",
			language: "python",
			timestamp: "2024-01-18T10:30:00",
			code: "def fibonacci(n):\n    if n <= 1:\n        return n\n    return fibonacci(n-1) + fibonacci(n-2)\n\nprint(fibonacci(10))",
			output: "55",
			success: true,
			fileUrl: "https://example.com/fib.png",
		},
		{
			id: "2",
			language: "cpp",
			timestamp: "2024-01-18T09:15:00",
			code: '#include <iostream>\nusing namespace std;\n\nint main() {\n    cout << "Hello World";\n    return 0;\n}',
			output: "Hello World",
			success: true,
		},
		{
			id: "3",
			language: "java",
			timestamp: "2024-01-17T15:45:00",
			code: 'public class Main {\n    public static void main(String[] args) {\n        System.out.println("Error example");\n        int x = 1 / 0;\n    }\n}',
			output:
				'Exception in thread "main" java.lang.ArithmeticException: / by zero\n\tat Main.main(Main.java:4)',
			success: false,
		},
		{
			id: "4",
			language: "python",
			timestamp: "2024-01-17T14:20:00",
			code: 'for i in range(5):\n    print(f"Number: {i}")',
			output: "Number: 0\nNumber: 1\nNumber: 2\nNumber: 3\nNumber: 4",
			success: true,
		},
	];

	// Query history data
	const { data: history, isLoading } = useQuery<HistoryItem[]>({
		queryKey: ["history"],
		queryFn: async () => {
			await new Promise((resolve) => setTimeout(resolve, 1500));
			return mockHistory;
		},
	});

	// Filter history items
	const filteredHistory = React.useMemo(() => {
		if (!history) return [];

		if (!searchQuery) return history;

		return history.filter((item) => {
			const searchLower = searchQuery.toLowerCase();
			return (
				item.code.toLowerCase().includes(searchLower) ||
				item.output.toLowerCase().includes(searchLower)
			);
		});
	}, [history, searchQuery]);

	// Handlers
	const handleCopyCode = (code: string) => {
		navigator.clipboard.writeText(code);
		toast("Code copied to clipboard");
	};

	// Loading state
	if (isLoading) {
		return (
			<div className="flex h-[80vh] items-center justify-center">
				<div className="text-center">
					<Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-500" />
					<p className="text-muted-foreground">Loading code history...</p>
				</div>
			</div>
		);
	}

	return (
		<div className="container mx-auto p-6 max-w-6xl">
			{/* Header Section */}
			<motion.div
				initial={{ opacity: 0, y: -20 }}
				animate={{ opacity: 1, y: 0 }}
				className="flex flex-col space-y-4 md:flex-row md:justify-between md:items-center mb-8"
			>
				<div>
					<h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
						Code History
					</h1>
					<p className="text-muted-foreground mt-1">
						View and manage your past code executions
					</p>
				</div>

				{/* Search */}
				<div className="relative w-full md:w-[300px]">
					<Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
					<Input
						placeholder="Search code or output..."
						className="pl-8 w-full"
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
					/>
				</div>
			</motion.div>

			{/* History List */}
			<AnimatePresence mode="popLayout">
				{filteredHistory.length === 0 ? (
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: -20 }}
						className="text-center py-12"
					>
						<EyeOff className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
						<h3 className="text-lg font-medium text-muted-foreground mb-1">
							No executions found
						</h3>
						<p className="text-sm text-muted-foreground/80">
							Try adjusting your search query
						</p>
					</motion.div>
				) : (
					<div className="space-y-4">
						{filteredHistory.map((item, index) => (
							<motion.div
								key={item.id}
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ delay: index * 0.1 }}
								className="group border rounded-lg p-4 bg-card hover:shadow-md transition-all duration-300"
							>
								{/* Header */}
								<div className="flex justify-between items-start mb-4">
									<div className="space-y-1.5">
										<div className="flex items-center space-x-2">
											<Badge
												variant={item.language}
												className="text-xs"
												showIcon
											>
												{item.language.toUpperCase()}
											</Badge>
											{item.success ? (
												<Badge variant="success" className="text-xs">
													<CheckCircle2 className="mr-1 h-3 w-3" />
													Success
												</Badge>
											) : (
												<Badge variant="destructive" className="text-xs">
													<XCircle className="mr-1 h-3 w-3" />
													Error
												</Badge>
											)}
										</div>
										<div className="flex items-center text-sm text-muted-foreground">
											<Calendar className="mr-1.5 h-4 w-4" />
											{new Date(item.timestamp).toLocaleDateString()}
											<Clock className="ml-3 mr-1.5 h-4 w-4" />
											{new Date(item.timestamp).toLocaleTimeString()}
										</div>
									</div>

									<div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
										<TooltipProvider>
											<Tooltip>
												<TooltipTrigger asChild>
													<Button
														variant="ghost"
														size="sm"
														onClick={() => handleCopyCode(item.code)}
													>
														<Copy className="h-4 w-4" />
													</Button>
												</TooltipTrigger>
												<TooltipContent>Copy code</TooltipContent>
											</Tooltip>
										</TooltipProvider>

										<TooltipProvider>
											<Tooltip>
												<TooltipTrigger asChild>
													<Button
														variant="ghost"
														size="sm"
														onClick={() => setSelectedItem(item)}
													>
														<Terminal className="h-4 w-4" />
													</Button>
												</TooltipTrigger>
												<TooltipContent>View details</TooltipContent>
											</Tooltip>
										</TooltipProvider>

										{item.fileUrl && (
											<TooltipProvider>
												<Tooltip>
													<TooltipTrigger asChild>
														<Button
															variant="ghost"
															size="sm"
															onClick={() =>
																window.open(item.fileUrl, "_blank")
															}
														>
															<ExternalLink className="h-4 w-4" />
														</Button>
													</TooltipTrigger>
													<TooltipContent>View original file</TooltipContent>
												</Tooltip>
											</TooltipProvider>
										)}
									</div>
								</div>

								{/* Code Preview */}
								<div className="relative">
									<pre className="p-4 bg-muted rounded-md overflow-x-auto">
										<CodeBlock
											code={item.code}
											language={item.language}
											maxHeight="200px"
										/>
									</pre>
								</div>
							</motion.div>
						))}
					</div>
				)}
			</AnimatePresence>

			{/* Details Dialog */}
			<Dialog open={!!selectedItem} onOpenChange={() => setSelectedItem(null)}>
				<DialogContent className="max-w-4xl h-[80vh] p-0">
					<DialogHeader className="p-6 pb-0">
						<DialogTitle>Execution Details</DialogTitle>
					</DialogHeader>

					<ScrollArea className="h-[calc(80vh-4rem)] px-6 pb-6">
						{selectedItem && (
							<div className="space-y-6">
								{/* Meta Information */}
								<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
									<div className="space-y-1">
										<div className="text-sm font-medium text-muted-foreground">
											Language
										</div>
										<Badge
											variant={selectedItem.language}
											className="text-xs"
											showIcon
										>
											{selectedItem.language.toUpperCase()}
										</Badge>
									</div>
									<div className="space-y-1">
										<div className="text-sm font-medium text-muted-foreground">
											Status
										</div>
										{selectedItem.success ? (
											<Badge variant="success" className="text-xs">
												<CheckCircle2 className="mr-1 h-3 w-3" />
												Success
											</Badge>
										) : (
											<Badge variant="destructive" className="text-xs">
												<XCircle className="mr-1 h-3 w-3" />
												Error
											</Badge>
										)}
									</div>
									<div className="space-y-1">
										<div className="text-sm font-medium text-muted-foreground">
											Date
										</div>
										<div className="flex items-center text-sm">
											<Calendar className="mr-1.5 h-4 w-4" />
											{new Date(selectedItem.timestamp).toLocaleDateString()}
										</div>
									</div>
									<div className="space-y-1">
										<div className="text-sm font-medium text-muted-foreground">
											Time
										</div>
										<div className="flex items-center text-sm">
											<Clock className="mr-1.5 h-4 w-4" />
											{new Date(selectedItem.timestamp).toLocaleTimeString()}
										</div>
									</div>
								</div>

								{/* Original File Preview */}
								{selectedItem.fileUrl && (
									<div className="space-y-2 overflow-hidden">
										<div className="flex items-center justify-between">
											<div className="text-sm font-medium text-muted-foreground">
												Original File
											</div>
											<Button
												variant="ghost"
												size="sm"
												onClick={() =>
													window.open(selectedItem.fileUrl, "_blank")
												}
											>
												<ExternalLink className="h-4 w-4 mr-1.5" />
												Open in new tab
											</Button>
										</div>
										<div className="border rounded-lg h-[200px] overflow-hidden">
											{selectedItem.fileUrl.toLowerCase().endsWith(".pdf") ? (
												<iframe
													src={selectedItem.fileUrl}
													className="w-full h-full"
													title="Original PDF"
												/>
											) : (
												<img
													src={selectedItem.fileUrl}
													alt="Original file"
													className="w-full h-full object-contain bg-muted/30"
												/>
											)}
										</div>
									</div>
								)}

								{/* Code Section */}
								<div className="space-y-2">
									<div className="flex items-center justify-between">
										<div className="text-sm font-medium text-muted-foreground">
											Source Code
										</div>
										<Button
											variant="ghost"
											size="sm"
											onClick={() => handleCopyCode(selectedItem.code)}
										>
											<Copy className="h-4 w-4 mr-1.5" />
											Copy code
										</Button>
									</div>
									<div className="p-4 bg-muted rounded-md overflow-x-auto">
										<CodeBlock
											code={selectedItem.code}
											language={selectedItem.language}
										/>
									</div>
								</div>

								{/* Output Section */}
								<div className="space-y-2">
									<div className="text-sm font-medium text-muted-foreground">
										Execution Output
									</div>
									<div className="p-4 bg-muted/50 rounded-md overflow-x-auto">
										<pre className="text-sm whitespace-pre-wrap font-mono">
											{selectedItem.output}
										</pre>
									</div>
								</div>
							</div>
						)}
					</ScrollArea>
				</DialogContent>
			</Dialog>
		</div>
	);
}
