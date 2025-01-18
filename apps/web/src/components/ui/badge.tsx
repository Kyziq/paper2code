import { type VariantProps, cva } from "class-variance-authority";
import type * as React from "react";
import { cn } from "~/lib/utils";

const badgeVariants = cva(
	"inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
	{
		variants: {
			variant: {
				default:
					"border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
				secondary:
					"border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
				destructive:
					"border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
				outline: "text-foreground",
				success:
					"border-transparent bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900 dark:text-green-100 dark:hover:bg-green-800",
				python:
					"border-transparent bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-100 dark:hover:bg-blue-800",
				cpp: "border-transparent bg-indigo-100 text-indigo-700 hover:bg-indigo-200 dark:bg-indigo-900 dark:text-indigo-100 dark:hover:bg-indigo-800",
				java: "border-transparent bg-amber-100 text-amber-700 hover:bg-amber-200 dark:bg-amber-900 dark:text-amber-100 dark:hover:bg-amber-800",
			},
		},
		defaultVariants: {
			variant: "default",
		},
	},
);

export interface BadgeProps
	extends React.HTMLAttributes<HTMLDivElement>,
		VariantProps<typeof badgeVariants> {
	showIcon?: boolean;
}

function Badge({
	className,
	variant,
	showIcon = false,
	children,
	...props
}: BadgeProps) {
	const getLanguageIcon = () => {
		if (!showIcon || !variant) return null;
		switch (variant) {
			case "python":
				return (
					<img
						src="/assets/icons/python.svg"
						alt=""
						className="w-3.5 h-3.5 mr-1"
						aria-hidden="true"
					/>
				);
			case "cpp":
				return (
					<img
						src="/assets/icons/cpp.svg"
						alt=""
						className="w-3.5 h-3.5 mr-1"
						aria-hidden="true"
					/>
				);
			case "java":
				return (
					<img
						src="/assets/icons/java.svg"
						alt=""
						className="w-3.5 h-3.5 mr-1"
						aria-hidden="true"
					/>
				);
			default:
				return null;
		}
	};

	return (
		<div className={cn(badgeVariants({ variant }), className)} {...props}>
			{getLanguageIcon()}
			{children}
		</div>
	);
}

export { Badge, badgeVariants };
