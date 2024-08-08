import React from "react";

interface ConsoleProps {
  message: string;
}

const Console: React.FC<ConsoleProps> = ({ message }) => {
  return (
    <div className="bg-gray-900 text-white font-mono p-4 rounded-lg shadow-lg w-full">
      <div className="bg-gray-800 p-2 rounded-t-lg flex items-center">
        <div className="h-3 w-3 bg-red-500 rounded-full mr-2"></div>
        <div className="h-3 w-3 bg-yellow-500 rounded-full mr-2"></div>
        <div className="h-3 w-3 bg-green-500 rounded-full"></div>
        <div className="flex-1 text-center text-gray-400 text-sm">paper2code</div>
      </div>
      <div className="bg-black p-4 rounded-b-lg h-64 overflow-y-auto font-caskaydiaCoveNerd">
        <div className="text-gray-200">{message || "# Your output will appear here."}</div>
      </div>
    </div>
  );
};

export default Console;
