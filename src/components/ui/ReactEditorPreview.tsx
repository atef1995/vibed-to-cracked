"use client";

import { LiveProvider, LiveEditor, LiveError, LivePreview } from "react-live";
import { useState } from "react";
import { AppWindowIcon, CodeIcon } from "lucide-react";
import getMoodColors from "@/lib/getMoodColors";
import { useMoodColors } from "@/hooks/useMoodColors";

interface ReactEditorPreviewProps {
  initialCode: string;
  title?: string;
  height?: number;
  editable?: boolean;
  showConsole?: boolean;
}

export function ReactEditorPreview({
  initialCode,
  title = "React Editor & Preview",
  height = 500,
  editable = true,
}: ReactEditorPreviewProps) {
  const [activeTab, setActiveTab] = useState<"code" | "preview">("preview");
  const currentMood = useMoodColors()

  // Clean up the code - remove imports and exports for react-live
  // and add render() call for noInline mode
  const cleanCode = (() => {
    let code = initialCode
      // Remove import statements
      .replace(/import\s+.*?from\s+['"].*?['"];?\s*\n?/g, "")
      // Remove export default
      .replace(/export\s+default\s+/g, "")
      // Remove export keyword
      .replace(/export\s+/g, "")
      .trim();
    
    // For noInline mode, we need to call render() at the end
    // Check if there's a function App or similar component
    const componentMatch = code.match(/function\s+(\w+)\s*\(/);
    if (componentMatch) {
      const componentName = componentMatch[1];
      // Add render call if not already present
      if (!code.includes("render(")) {
        code = code + `\n\nrender(<${componentName} />);`;
      }
    }
    
    return code;
  })();

  return (
    <div
      className={`border  dark:border-gray-600 rounded-lg overflow-hidden `}
      style={{ height: `${height}px` }}
    >
      {/* Header */}
      <div className={`${currentMood.bg} px-4 py-2 dark:border-gray-600 flex items-center justify-between`}>
        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
          </div>
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300 ml-2">
            {title}
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className={`${currentMood.bg} dark:bg-gray-750 px-2 py-1 border-b border-gray-200 dark:border-gray-600 flex gap-1`}>
        <button
          onClick={() => setActiveTab("code")}
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-sm font-medium transition-all ${
            activeTab === "code"
              ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow"
              : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          }`}
        >
          <CodeIcon size={14} />
          Code
        </button>
        <button
          onClick={() => setActiveTab("preview")}
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-sm font-medium transition-all ${
            activeTab === "preview"
              ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow"
              : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          }`}
        >
          <AppWindowIcon size={14} />
          Preview
        </button>
      </div>

      {/* Content */}
      <div style={{ height: `${height - 90}px` }} className="overflow-hidden">
        <LiveProvider code={cleanCode} noInline={true}>
          {activeTab === "code" ? (
            <div className="h-full overflow-auto">
              <LiveEditor
                disabled={!editable}
                className="!font-mono !text-sm !bg-gray-900 !min-h-full"
                style={{
                  fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace',
                  fontSize: "14px",
                  backgroundColor: "#1e1e1e",
                  minHeight: "100%",
                }}
              />
            </div>
          ) : (
            <div className="h-full overflow-auto bg-white dark:bg-gray-900 p-4">
              <LiveError className="text-red-500 bg-red-50 dark:bg-red-900/20 p-3 rounded-md mb-4 text-sm font-mono" />
              <LivePreview className="react-live-preview" />
            </div>
          )}
        </LiveProvider>
      </div>
    </div>
  );
}
