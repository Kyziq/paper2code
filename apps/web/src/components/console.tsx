import { Terminal } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";

interface ConsoleProps {
	message: string;
}

export const Console = ({ message }: ConsoleProps) => {
	const consoleRef = useRef<HTMLDivElement>(null);
	const [lines, setLines] = useState<string[]>([]);
	const [isTyping, setIsTyping] = useState(false);

	useEffect(() => {
		const newLines = message.trim()
			? message.split("\n")
			: ["Your output will appear here."];
		setIsTyping(true);
		setLines(newLines);

		// Auto-scroll after typing effect
		if (consoleRef.current) {
			consoleRef.current.scrollTop = consoleRef.current.scrollHeight;
		}

		const timer = setTimeout(
			() => {
				setIsTyping(false);
			},
			newLines.length * 50 + 300,
		);

		return () => clearTimeout(timer);
	}, [message]);

	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.3 }}
			className="w-full h-full flex flex-col overflow-hidden rounded-lg bg-zinc-900 font-mono text-zinc-100 shadow-xl"
		>
			<motion.div
				className="flex items-center justify-between bg-zinc-800 p-3"
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				transition={{ delay: 0.2 }}
			>
				<div className="flex items-center space-x-2">
					<Terminal size={18} />
					<span className="font-caskaydiaCoveNerd text-sm font-semibold">
						Console Output
					</span>
				</div>
				<div className="flex space-x-1.5">
					<motion.div
						className="h-3 w-3 rounded-full bg-red-500"
						whileHover={{ scale: 1.2 }}
					/>
					<motion.div
						className="h-3 w-3 rounded-full bg-yellow-500"
						whileHover={{ scale: 1.2 }}
					/>
					<motion.div
						className="h-3 w-3 rounded-full bg-green-500"
						whileHover={{ scale: 1.2 }}
					/>
				</div>
			</motion.div>

			<div
				ref={consoleRef}
				className="flex-1 min-h-0 overflow-y-auto bg-zinc-950 p-4"
			>
				<AnimatePresence mode="wait">
					{lines.map((line, index) => (
						<motion.div
							key={`${index}-${line}`}
							initial={{ opacity: 0, x: -10 }}
							animate={{ opacity: 1, x: 0 }}
							exit={{ opacity: 0, x: 10 }}
							transition={{
								duration: 0.2,
								delay: index * 0.05,
								ease: [0.32, 0.72, 0, 1],
							}}
							className="mb-1 flex"
						>
							<motion.span
								className="text-green-400 mr-2"
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								transition={{ delay: index * 0.05 + 0.1 }}
							>
								&gt;
							</motion.span>
							<motion.span
								className={`font-caskaydiaCoveNerd ${
									message.trim() ? "text-zinc-300" : "italic text-zinc-500"
								}`}
							>
								{line || " "}
							</motion.span>
							{isTyping && index === lines.length - 1 && (
								<motion.span
									initial={{ opacity: 0 }}
									animate={{ opacity: [0, 1, 0] }}
									transition={{
										repeat: Number.POSITIVE_INFINITY,
										duration: 1,
										ease: "linear",
									}}
									className="ml-1 text-zinc-300"
								>
									▋
								</motion.span>
							)}
						</motion.div>
					))}
				</AnimatePresence>
			</div>
		</motion.div>
	);
};
