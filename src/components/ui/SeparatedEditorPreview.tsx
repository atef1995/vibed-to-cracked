"use client";

import { useState } from "react";
import {
  Eye,
  EyeOff,
  RotateCcw,
  Code2,
  FileText,
  Palette,
  Play,
  Copy,
  Check,
} from "lucide-react";
import CodeEditor from "../CodeEditor";

interface SeparatedEditorPreviewProps {
  initialHtml: string;
  initialCss?: string;
  title?: string;
  height?: string;
  showHtmlEditor?: boolean;
  showCssEditor?: boolean;
  instructions?: string;
  mission?: string;
}

export function SeparatedEditorPreview({
  initialHtml,
  initialCss = "",
  title = "HTML & CSS Editor",
  height = "50%",
  showHtmlEditor = true,
  showCssEditor = true,
  instructions,
  mission,
}: SeparatedEditorPreviewProps) {
  const [html, setHtml] = useState(initialHtml);
  const [css, setCss] = useState(initialCss);
  const [activeTab, setActiveTab] = useState<"html" | "css" | "preview">("css");
  const [isVisible, setIsVisible] = useState(true);
  const [copied, setCopied] = useState(false);
  const [resetKey, setResetKey] = useState(0);

  const generatePreviewHTML = () => {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CSS Tutorial Preview</title>
    <style>
        body {
            margin: 0;
            padding: 20px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
            line-height: 1.5;
            background: #ffffff;
        }
        
        /* Your CSS goes here */
        ${css}
    </style>
</head>
<body>
    ${html}
</body>
</html>`;
  };

  const handleCopy = async () => {
    const fullCode = `<!-- HTML -->
${html}

<style>
/* CSS */
${css}
</style>`;

    try {
      await navigator.clipboard.writeText(fullCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const handleReset = () => {
    setHtml(initialHtml);
    setCss(initialCss);
    setResetKey((prev) => prev + 1); // Force re-mount editors
  };

  return (
    <div
      className={` dark:border-gray-700 rounded-lg overflow-hidden mb-6 h-full`}
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-700 px-4 py-3">
        <div className="flex items-center justify-between">
          <h3 className="text-white font-semibold flex items-center gap-2">
            <Code2 className="w-5 h-5" />
            {title}
          </h3>
          <div className="flex items-center gap-2">
            <button
              onClick={handleReset}
              className="text-white/80 hover:text-white transition-colors active:scale-95 p-1.5 rounded hover:bg-white/10 cursor-pointer"
              title="Reset to original"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={handleCopy}
              className="text-white/80 hover:text-white transition-colors p-1.5 active:scale-95 rounded hover:bg-white/10 cursor-pointer"
              title="Copy code"
            >
              {copied ? (
                <Check className="w-4 h-4" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>
            <button
              onClick={() => setIsVisible(!isVisible)}
              className="text-white/80 hover:text-white transition-colors p-1.5 active:scale-95 rounded hover:bg-white/10 cursor-pointer"
              title={isVisible ? "Hide preview" : "Show preview"}
            >
              {isVisible ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Instructions */}
      {(instructions || mission) && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border-b-2 border-yellow-200 dark:border-yellow-700 px-4 py-3">
          {mission && (
            <div className="mb-2">
              <h4 className="text-yellow-800 dark:text-yellow-300 font-semibold text-sm mb-1">
                Your Mission:
              </h4>
              <p className="text-yellow-700 dark:text-yellow-200 text-sm">
                {mission}
              </p>
            </div>
          )}
          {instructions && (
            <div>
              <h4 className="text-yellow-800 dark:text-yellow-300 font-semibold text-sm mb-1">
                Instructions:
              </h4>
              <p className="text-yellow-700 dark:text-yellow-200 text-sm">
                {instructions}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Tab Navigation */}
      <div className="my-2 bg-gray-700 border border-transparent rounded-xl">
        <div className="flex space-x-2 border border-transparent rounded-xl p-2">
          {showHtmlEditor && (
            <button
              onClick={() => setActiveTab("html")}
              className={`px-4 py-2 text-sm font-medium border-b-2 flex items-center gap-2 cursor-pointer rounded-xl backdrop-blur-3xl bg-blue-500 hover:bg-blue-700 transition-all duration-100 active:scale-90 ${
                activeTab === "html"
                  ? "border-blue-500 bg-blue-700" 
                  : "border-transparent text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100"
              }`}
            >
              <FileText className="w-4 h-4" />
              HTML
            </button>
          )}
          {showCssEditor && (
            <button
              onClick={() => setActiveTab("css")}
              className={`px-4 py-2 text-sm font-medium border-b-2 flex items-center gap-2 cursor-pointer rounded-xl bg-purple-500 hover:bg-purple-700 active:scale-95 transition-all duration-100 ${
                activeTab === "css"
                  ? "border-purple-500 bg-white dark:bg-purple-900"
                  : "border-transparent text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100"
              }`}
            >
              <Palette className="w-4 h-4" />
              CSS
            </button>
          )}
        </div>
      </div>

      {/* Content Area */}
      <div className="h-full">
        {/* HTML Editor */}
        {activeTab === "html" && showHtmlEditor && (
             <CodeEditor
              height={height}
              key={`html-${resetKey}`}
              language="html"
              initialCode={html}
              onCodeChange={(code) => setHtml(code)}
            ></CodeEditor>
        )}

        {/* CSS Editor */}
        {activeTab === "css" && showCssEditor && (
          <div className="h-full">
            <CodeEditor
              height={height}

              key={`css-${resetKey}`}
              language="css"
              initialCode={css}
              onCodeChange={(code) => setCss(code)}
            ></CodeEditor>
          </div>
        )}

        {/* Preview */}
        {activeTab === "preview" && isVisible && (
          <div className="h-full">
            <iframe
              srcDoc={generatePreviewHTML()}
              title="Preview"
              className="w-full h-full min-h-96 border-0"
              sandbox="allow-scripts"
            />
          </div>
        )}
      </div>
      {/* Preview */}
      {isVisible && (
        <div className="h-full">
          <iframe
            srcDoc={generatePreviewHTML()}
            title="Preview"
            className="w-full h-full min-h-96 border-0"
            sandbox="allow-scripts"
          />
        </div>
      )}

      {/* Footer with tips */}
      <div className="bg-gray-50 dark:bg-gray-700 px-4 py-2 border-t border-gray-200 dark:border-gray-600">
        <p className="text-xs text-gray-600 dark:text-gray-300">
          <strong>💡 Pro Tip:</strong> In real projects, keep HTML and CSS in
          separate files. This editor simulates that workflow - edit CSS in the
          CSS tab, HTML in the HTML tab!
        </p>
      </div>
    </div>
  );
}
