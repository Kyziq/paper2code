import * as React from "react";
import { cn } from "~/lib/utils";

const spinnerVariants =
	"w-16 h-16 border-4 border-t-4 border-gray-200 border-t-gray-600 rounded-full animate-spin";

interface LoadingSpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
	className?: string;
}

const LoadingSpinner = React.forwardRef<HTMLDivElement, LoadingSpinnerProps>(
	(props, ref) => {
		const { className, ...rest } = props;
		return (
			<div ref={ref} className={cn(spinnerVariants, className)} {...rest} />
		);
	},
);

LoadingSpinner.displayName = "LoadingSpinner";

export { LoadingSpinner };

// import * as React from "react";
// import { cn } from "@/lib/utils";
// import { LoaderIcon } from "lucide-react";

// const spinnerVariants = "w-16 h-16 rounded-full animate-spin";

// interface LoadingSpinnerProps extends React.HTMLAttributes<SVGSVGElement> {
//   className?: string;
// }

// const LoadingSpinner2 = React.forwardRef<SVGSVGElement, LoadingSpinnerProps>((props, ref) => {
//   const { className, ...rest } = props;
//   return <LoaderIcon ref={ref} className={cn(spinnerVariants, className)} {...rest} />;
// });

// LoadingSpinner2.displayName = "LoadingSpinner";

// export { LoadingSpinner2 };
