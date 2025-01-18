import { motion } from "motion/react";
import { Card, CardContent, CardHeader } from "~/components/ui/card";
import { Skeleton } from "~/components/ui/skeleton";

export default function HistorySkeleton() {
	return (
		<div className="container mx-auto p-6 max-w-6xl">
			{/* Header Section */}
			<div className="flex flex-col space-y-4 md:flex-row md:justify-between md:items-center mb-8">
				<div className="space-y-2">
					<Skeleton className="h-8 w-48" />
					<Skeleton className="h-4 w-64" />
				</div>
				<Skeleton className="h-10 w-full md:w-[300px]" />
			</div>

			{/* History List */}
			<div className="space-y-4">
				{[1, 2, 3].map((index) => (
					<Card key={index} className="relative overflow-hidden">
						<CardHeader className="pb-2">
							<div className="flex justify-between items-start">
								<div className="space-y-2">
									<div className="flex gap-2">
										<Skeleton className="h-5 w-16" />
										<Skeleton className="h-5 w-20" />
									</div>
									<div className="flex items-center gap-2">
										<Skeleton className="h-4 w-24" />
										<Skeleton className="h-4 w-24" />
									</div>
								</div>
								<div className="flex gap-2">
									<Skeleton className="h-8 w-8 rounded-md" />
									<Skeleton className="h-8 w-8 rounded-md" />
									<Skeleton className="h-8 w-8 rounded-md" />
								</div>
							</div>
						</CardHeader>
						<CardContent>
							<div className="space-y-2">
								<Skeleton className="h-40 w-full" />
							</div>
						</CardContent>

						{/* Shimmer effect */}
						<motion.div
							className="absolute inset-0 -translate-x-full"
							animate={{
								translateX: ["-100%", "100%"],
							}}
							transition={{
								duration: 1.5,
								repeat: Number.POSITIVE_INFINITY,
								ease: "linear",
							}}
							style={{
								background:
									"linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)",
							}}
						/>
					</Card>
				))}
			</div>
		</div>
	);
}
