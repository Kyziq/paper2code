import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { AnimatePresence } from "framer-motion";
import {
	Calendar,
	CheckCircle2,
	Clock,
	CodeSquare,
	Copy,
	ExternalLink,
	Search,
	Terminal,
	XCircle,
} from "lucide-react";
import React, { useState } from "react";
import { toast } from "sonner";
import { CodeBlock } from "~/components/code-block";
import SnippetsSkeleton from "~/components/skeleton/snippets";
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
interface Snippet {
	id: string;
	language: "python" | "cpp" | "java";
	timestamp: string;
	code: string;
	output: string;
	fileUrl?: string;
	success: boolean;
}

export const Route = createFileRoute("/_auth/app/_app/snippets")({
	component: SnippetsComponent,
});

function SnippetsComponent() {
	// State
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedSnippet, setSelectedSnippet] = useState<Snippet | null>(null);

	// Mock data
	const mockSnippets: Snippet[] = [
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

	// Query snippets data
	const { data: snippets, isLoading } = useQuery<Snippet[]>({
		queryKey: ["snippets"],
		queryFn: async () => {
			await new Promise((resolve) => setTimeout(resolve, 1500));
			return mockSnippets;
		},
	});

	// Filter snippets
	const filteredSnippets = React.useMemo(() => {
		if (!snippets) return [];

		if (!searchQuery) return snippets;

		return snippets.filter((snippet) => {
			const searchLower = searchQuery.toLowerCase();
			return (
				snippet.code.toLowerCase().includes(searchLower) ||
				snippet.output.toLowerCase().includes(searchLower)
			);
		});
	}, [snippets, searchQuery]);

	// Handlers
	const handleCopyCode = (code: string) => {
		navigator.clipboard.writeText(code);
		toast("Code copied to clipboard");
	};

	// Loading state
	if (isLoading) {
		return <SnippetsSkeleton />;
	}

	return (
		<div className="container mx-auto p-6 max-w-6xl">
			{/* Header Section */}
			<div className="flex flex-col space-y-4 md:flex-row md:justify-between md:items-center mb-8">
				<div>
					<h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
						Code Snippets
					</h1>
					<p className="text-muted-foreground mt-1">
						Your saved code collection
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
			</div>

			{/* Snippets List */}
			<AnimatePresence mode="popLayout">
				{filteredSnippets.length === 0 ? (
					<div className="text-center py-12">
						<CodeSquare className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
						<h3 className="text-lg font-medium text-muted-foreground mb-1">
							No snippets found
						</h3>
						<p className="text-sm text-muted-foreground/80">
							Save your code executions to build your snippet collection
						</p>
					</div>
				) : (
					<div className="space-y-4">
						{filteredSnippets.map((item) => (
							<div
								key={item.id}
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
														onClick={() => setSelectedSnippet(item)}
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
							</div>
						))}
					</div>
				)}
			</AnimatePresence>

			{/* Details Dialog */}
			<Dialog
				open={!!selectedSnippet}
				onOpenChange={() => setSelectedSnippet(null)}
			>
				<DialogContent className="max-w-4xl h-[80vh] p-0">
					<DialogHeader className="p-6 pb-0">
						<DialogTitle>Snippet Details</DialogTitle>
					</DialogHeader>

					<ScrollArea className="h-[calc(80vh-4rem)] px-6 pb-6">
						{selectedSnippet && (
							<div className="space-y-6">
								{/* Meta Information */}
								<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
									<div className="space-y-1">
										<div className="text-sm font-medium text-muted-foreground">
											Language
										</div>
										<Badge
											variant={selectedSnippet.language}
											className="text-xs"
											showIcon
										>
											{selectedSnippet.language.toUpperCase()}
										</Badge>
									</div>
									<div className="space-y-1">
										<div className="text-sm font-medium text-muted-foreground">
											Status
										</div>
										{selectedSnippet.success ? (
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
											{new Date(selectedSnippet.timestamp).toLocaleDateString()}
										</div>
									</div>
									<div className="space-y-1">
										<div className="text-sm font-medium text-muted-foreground">
											Time
										</div>
										<div className="flex items-center text-sm">
											<Clock className="mr-1.5 h-4 w-4" />
											{new Date(selectedSnippet.timestamp).toLocaleTimeString()}
										</div>
									</div>
								</div>

								{/* Original File Preview */}
								{selectedSnippet.fileUrl && (
									<div className="space-y-2 overflow-hidden">
										<div className="flex items-center justify-between">
											<div className="text-sm font-medium text-muted-foreground">
												Original File
											</div>
											<Button
												variant="ghost"
												size="sm"
												onClick={() =>
													window.open(selectedSnippet.fileUrl, "_blank")
												}
											>
												<ExternalLink className="h-4 w-4 mr-1.5" />
												Open in new tab
											</Button>
										</div>
										<div className="border rounded-lg h-[200px] overflow-hidden">
											{selectedSnippet.fileUrl
												.toLowerCase()
												.endsWith(".pdf") ? (
												<iframe
													src={selectedSnippet.fileUrl}
													className="w-full h-full"
													title="Original PDF"
												/>
											) : (
												<img
													src={selectedSnippet.fileUrl}
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
											onClick={() => handleCopyCode(selectedSnippet.code)}
										>
											<Copy className="h-4 w-4 mr-1.5" />
											Copy code
										</Button>
									</div>
									<div className="p-4 bg-muted rounded-md overflow-x-auto">
										<CodeBlock
											code={selectedSnippet.code}
											language={selectedSnippet.language}
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
											{selectedSnippet.output}
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
