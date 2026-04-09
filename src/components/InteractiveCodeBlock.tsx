"use client";

import React, { useMemo } from "react";
import { Lightbulb } from "lucide-react";
import CodeEditor from "./CodeEditor";
import dynamic from "next/dynamic";

// Lazy load MultiFileCodeEditor to avoid SSR issues with WebContainer
const MultiFileCodeEditor = dynamic(() => import("./MultiFileCodeEditor"), {
  ssr: false,
  loading: () => (
    <div className="h-75 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse" />
  ),
});

interface CodeFile {
  name: string;
  content: string;
  language?: string;
  isEntryPoint?: boolean;
}

interface InteractiveCodeBlockProps {
  children?: React.ReactNode;
  initialCode?: string;
  editable?: boolean;
  title?: string;
  description?: string;
  language?: string;
  height?: string;
  files?: CodeFile[]; // Multi-file support
}

const InteractiveCodeBlock: React.FC<InteractiveCodeBlockProps> = ({
  children,
  initialCode,
  editable = true,
  title,
  height,
  description,
  language = "javascript",
  files,
}) => {
  language = language?.replace(/language-/, "") || "javascript";
  if (language === "js" || language === "dsa") language = "javascript";

  // Keep nodejs/node as separate language for proper module system selection
  // but normalize for Monaco editor display
  if (language === "nodejs" || language === "node") {
    // but keep original language for execution
  } else if (
    language === "html" ||
    language === "bash" ||
    language === "css" ||
    language === "jsx" ||
    language === "web"
  ) {
    editable = false;
  } else if (language === "react") {
    language = "jsx";
    editable = false;
  }

  // Extract code from children if provided
  const codeFromChildren = useMemo(() => {
    if (typeof children === "string") {
      return children.trim();
    }

    // Handle MDX children (React elements)
    if (React.isValidElement(children)) {
      // If it's a code element, extract the text content
      if (children.type === "code") {
        const props = children.props as { children?: string };
        return props.children || "";
      }
    }

    // Handle multiple children or text nodes
    if (React.Children.count(children) > 0) {
      const textContent = React.Children.toArray(children)
        .map((child) => {
          if (typeof child === "string") {
            return child;
          }
          if (React.isValidElement(child) && child.type === "code") {
            const props = child.props as { children?: string };
            return props.children || "";
          }
          if (React.isValidElement(child)) {
            const props = child.props as { children?: string };
            if (typeof props.children === "string") {
              return props.children;
            }
          }
          return "";
        })
        .join("")
        .trim();

      return textContent;
    }

    return "";
  }, [children]);

  const code = initialCode || codeFromChildren;

  const effectiveHeight = useMemo(() => {
    if (height) return height;
    const lines = code.split("\n").length;
    const editorLines = Math.max(lines + 2, 4);
    return `${Math.min(editorLines * 21, 420)}px`;
  }, [height, code]);

  // Detect if code uses CommonJS (module.exports, require)
  const usesCommonJS = useMemo(() => {
    return (
      code.includes("module.exports") ||
      code.includes("exports.") ||
      /\brequire\s*\(/.test(code)
    );
  }, [code]);

  // Detect if code uses ES modules (import/export)
  // Only count as ESM if it doesn't also use CommonJS
  const usesESModules = useMemo(() => {
    if (usesCommonJS) return false;
    return (
      /\bimport\s+/.test(code) ||
      /\bexport\s+(default|const|let|var|function|class|\{)/.test(code)
    );
  }, [code, usesCommonJS]);

  // If files are provided, use MultiFileCodeEditor
  // Or if code uses ES modules, auto-create multi-file setup
  const shouldUseMultiFile = files || usesESModules;

  const effectiveFiles = useMemo(() => {
    if (files) return files;

    if (usesESModules) {
      // Auto-create multi-file setup for ES modules
      return [
        {
          name: "index.mjs",
          content: code,
          language: "javascript",
          isEntryPoint: true,
        },
        {
          name: "package.json",
          content: JSON.stringify(
            {
              name: "code-runner",
              type: "module",
              dependencies: {},
            },
            null,
            2
          ),
          language: "json",
        },
      ];
    }

    return [];
  }, [files, usesESModules, code]);

  return (
    <div className="my-4 sm:my-6">
      {(title || description) && (
        <div className="mb-3 sm:mb-4 px-2 sm:px-0">
          {title && (
            <h4 className="text-base sm:text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
              {title}
            </h4>
          )}
          {description && (
            <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm">
              {description}
            </p>
          )}
        </div>
      )}

      {shouldUseMultiFile ? (
        <MultiFileCodeEditor
          files={effectiveFiles}
          readOnly={!editable}
          height={effectiveHeight}
          canRun={editable}
        />
      ) : (
        <CodeEditor
          language={language}
          initialCode={code}
          readOnly={!editable}
          height={effectiveHeight}
          useWebContainer={
            language === "javascript" ||
            language === "nodejs" ||
            language === "node"
          }
          placeholder={
            editable
              ? "// Try modifying this code and click Run!"
              : "// This is a code example"
          }
        />
      )}

      {editable && (
        <div className="mt-2 px-2 sm:px-0 text-xs text-wrap text-gray-500 dark:text-gray-400 flex flex-wrap items-start sm:items-center gap-1">
          <Lightbulb className="h-3 w-3 shrink-0 mt-0.5 sm:mt-0" />
          <span className="leading-relaxed">
            Tip: Modify the code above and click &ldquo;Run&rdquo; to see the
            results
          </span>
        </div>
      )}
    </div>
  );
};

export default InteractiveCodeBlock;
