import React, { useEffect, useRef } from "react";
import { Terminal } from "lucide-react";

interface ConsoleProps {
  message: string;
}

const Console: React.FC<ConsoleProps> = ({ message }) => {
  const consoleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (consoleRef.current) {
      consoleRef.current.scrollTop = consoleRef.current.scrollHeight;
    }
  }, [message]);

  const displayMessage = message.trim() || "Your output will appear here.";

  return (
    <div className="bg-zinc-900 text-zinc-100 font-mono rounded-lg shadow-xl w-full max-w-2xl overflow-hidden">
      <div className="bg-zinc-800 p-3 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Terminal size={18} />
          <span className="text-sm font-semibold font-caskaydiaCoveNerd">Console Output</span>
        </div>
        <div className="flex space-x-1.5">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
        </div>
      </div>
      <div ref={consoleRef} className="p-4 h-64 overflow-y-auto bg-zinc-950">
        {displayMessage.split("\n").map((line, index) => (
          <div key={index} className="mb-1">
            <span className="text-green-400">&gt; </span>
            <span className={`font-caskaydiaCoveNerd ${message.trim() ? "text-zinc-300" : "text-zinc-500 italic"}`}>{line || " "}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export { Console };
