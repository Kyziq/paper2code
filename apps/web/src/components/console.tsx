import { Terminal } from 'lucide-react';
import React, { useEffect, useRef } from 'react';

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

  const displayMessage = message.trim() || 'Your output will appear here.';

  return (
    <div className="w-full max-w-2xl overflow-hidden rounded-lg bg-zinc-900 font-mono text-zinc-100 shadow-xl">
      <div className="flex items-center justify-between bg-zinc-800 p-3">
        <div className="flex items-center space-x-2">
          <Terminal size={18} />
          <span className="font-caskaydiaCoveNerd text-sm font-semibold">Console Output</span>
        </div>
        <div className="flex space-x-1.5">
          <div className="h-3 w-3 rounded-full bg-red-500"></div>
          <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
          <div className="h-3 w-3 rounded-full bg-green-500"></div>
        </div>
      </div>
      <div ref={consoleRef} className="h-64 overflow-y-auto bg-zinc-950 p-4">
        {displayMessage.split('\n').map((line, index) => (
          <div key={index} className="mb-1">
            <span className="text-green-400">&gt; </span>
            <span
              className={`font-caskaydiaCoveNerd ${message.trim() ? 'text-zinc-300' : 'italic text-zinc-500'}`}
            >
              {line || ' '}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export { Console };
