"use client";

import React, { useState, useCallback, useMemo } from "react";
import Editor from "@monaco-editor/react";
import type { editor } from "monaco-editor";
import { useTheme } from "@/components/providers/ThemeProvider";
import Console from "./Console";
import Button from "./ui/Button";
import { BUTTON_COLOR } from "@/types/button";
import {
  Copy,
  Check,
  Expand,
  Minimize,
  Play,
  StopCircle,
  File,
  FileJson,
} from "lucide-react";

interface ExecutionResult {
  output: string[];
  errors: string[];
  executionTime: number;
  isComplete?: boolean;
}

interface CodeFile {
  name: string;
  content: string;
  language?: string;
  isEntryPoint?: boolean;
}

interface MultiFileCodeEditorProps {
  files: CodeFile[];
  readOnly?: boolean;
  height?: string;
  onFilesChange?: (files: CodeFile[]) => void;
  canRun?: boolean;
}

const getFileIcon = (filename: string) => {
  if (filename.endsWith(".json")) return <FileJson className="w-3.5 h-3.5" />;
  return <File className="w-3.5 h-3.5" />;
};

const getLanguageFromFilename = (filename: string): string => {
  if (filename.endsWith(".ts") || filename.endsWith(".tsx"))
    return "typescript";
  if (filename.endsWith(".json")) return "json";
  if (filename.endsWith(".mjs")) return "javascript";
  if (filename.endsWith(".cjs")) return "javascript";
  if (filename.endsWith(".css")) return "css";
  if (filename.endsWith(".html")) return "html";
  return "javascript";
};

const MultiFileCodeEditor: React.FC<MultiFileCodeEditorProps> = ({
  files: initialFiles,
  readOnly = false,
  height = "300px",
  onFilesChange,
  canRun = true,
}) => {
  const [files, setFiles] = useState<CodeFile[]>(initialFiles);
  const [activeFileIndex, setActiveFileIndex] = useState(0);
  const [result, setResult] = useState<ExecutionResult | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [forceUpdateCounter, setForceUpdateCounter] = useState(0);
  const [streamingOutput, setStreamingOutput] = useState<string[]>([]);
  const { resolvedTheme } = useTheme();
  const editorRef = React.useRef<editor.IStandaloneCodeEditor | null>(null);

  // Detect if code uses CommonJS (module.exports, require)
  const usesCommonJS = useMemo(() => {
    return files.some(
      (f) =>
        f.content.includes("module.exports") ||
        f.content.includes("exports.") ||
        /\brequire\s*\(/.test(f.content)
    );
  }, [files]);

  // Detect if code uses ES modules (import/export)
  // Only count as ESM if it doesn't also use CommonJS
  const usesESModules = useMemo(() => {
    if (usesCommonJS) return false;
    return files.some(
      (f) =>
        /\bimport\s+/.test(f.content) ||
        /\bexport\s+(default|const|let|var|function|class|\{)/.test(f.content)
    );
  }, [files, usesCommonJS]);

  // Auto-add package.json with type: module if ES modules detected
  const effectiveFiles = useMemo(() => {
    const hasPackageJson = files.some((f) => f.name === "package.json");

    if (usesESModules && !hasPackageJson) {
      return [
        ...files,
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

    return files;
  }, [files, usesESModules]);

  // Active file from effectiveFiles (not files) to handle auto-added package.json
  const activeFile = effectiveFiles[activeFileIndex] || effectiveFiles[0];

  const handleFileChange = useCallback(
    (content: string) => {
      // Don't update auto-generated files (like package.json when not in original files)
      if (activeFileIndex >= files.length) {
        return;
      }
      const newFiles = [...files];
      newFiles[activeFileIndex] = { ...newFiles[activeFileIndex], content };
      setFiles(newFiles);
      onFilesChange?.(newFiles);
    },
    [activeFileIndex, files, onFilesChange]
  );

  const handleRunCode = async () => {
    if (isRunning) return;

    const entryFile =
      effectiveFiles.find((f) => f.isEntryPoint) ||
      effectiveFiles.find(
        (f) =>
          f.name === "index.js" ||
          f.name === "main.js" ||
          f.name === "script.js"
      ) ||
      effectiveFiles.find(
        (f) => f.name.endsWith(".js") || f.name.endsWith(".mjs")
      );

    if (!entryFile) {
      setResult({
        output: [],
        errors: ["No JavaScript entry file found"],
        executionTime: 0,
        isComplete: true,
      });
      return;
    }

    setIsRunning(true);
    setStreamingOutput([]);
    setResult({
      output: [],
      errors: [],
      executionTime: 0,
      isComplete: false,
    });

    try {
      const startTime = Date.now();

      // Dynamic import to avoid SSR issues
      const { WebContainer } = await import("@webcontainer/api");

      // Boot WebContainer
      const webcontainer = await WebContainer.boot();

      // Mount all files
      const mountFiles: Record<string, { file: { contents: string } }> = {};
      for (const file of effectiveFiles) {
        mountFiles[file.name] = {
          file: { contents: file.content },
        };
      }

      await webcontainer.mount(mountFiles);

      // Install dependencies if package.json has them
      const packageJsonFile = effectiveFiles.find(
        (f) => f.name === "package.json"
      );
      if (packageJsonFile) {
        try {
          const pkgJson = JSON.parse(packageJsonFile.content);
          if (
            pkgJson.dependencies &&
            Object.keys(pkgJson.dependencies).length > 0
          ) {
            setStreamingOutput((prev) => [
              ...prev,
              "Installing dependencies...",
            ]);
            const installProcess = await webcontainer.spawn("npm", ["install"]);
            await installProcess.exit;
          }
        } catch {
          // Invalid JSON, skip
        }
      }

      // Run the entry file
      const process = await webcontainer.spawn("node", [entryFile.name]);

      const logs: string[] = [];
      const errors: string[] = [];

      process.output.pipeTo(
        new WritableStream({
          write(data) {
            const chunk =
              typeof data === "string" ? data : new TextDecoder().decode(data);
            const lines = chunk.split("\n").filter((l) => l.trim());

            for (const line of lines) {
              if (
                line.toLowerCase().includes("error") ||
                line.toLowerCase().includes("syntaxerror")
              ) {
                errors.push(line);
              } else {
                logs.push(line);
              }
              setStreamingOutput((prev) => [...prev, line]);
            }
          },
        })
      );

      // Wait for process to complete with timeout
      const timeoutPromise = new Promise<number>((_, reject) =>
        setTimeout(() => reject(new Error("Execution timeout (10s)")), 10000)
      );

      try {
        await Promise.race([process.exit, timeoutPromise]);
      } catch (err) {
        errors.push(err instanceof Error ? err.message : "Execution timeout");
      }

      const executionTime = Date.now() - startTime;
      setResult({
        output: logs,
        errors,
        executionTime,
        isComplete: true,
      });
      setForceUpdateCounter((prev) => prev + 1);

      // Teardown
      await webcontainer.teardown();
    } catch (error) {
      console.error("Execution error:", error);
      setResult({
        output: [],
        errors: [
          error instanceof Error ? error.message : "Unknown error occurred",
        ],
        executionTime: 0,
        isComplete: true,
      });
    } finally {
      setIsRunning(false);
    }
  };

  const handleCopyCode = async () => {
    await navigator.clipboard.writeText(activeFile.content);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const activeLanguage =
    activeFile.language || getLanguageFromFilename(activeFile.name);

  return (
    <div className="rounded-lg overflow-hidden bg-white border border-blue-200 dark:border-transparent dark:bg-gray-800">
      {/* File Tabs */}
      <div className="flex flex-col sm:flex-row space-y-1 items-center bg-gray-100 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
        <div className="flex items-center flex-1 min-w-0">
          {effectiveFiles.map((file, index) => (
            <button
              key={file.name}
              onClick={() => setActiveFileIndex(index)}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium border-r border-gray-200 dark:border-gray-700 transition-colors whitespace-nowrap ${
                index === activeFileIndex
                  ? "bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50"
              }`}
            >
              {getFileIcon(file.name)}
              <span>{file.name}</span>
              {file.isEntryPoint && (
                <span className="ml-1 px-1 py-0.5 text-[10px] bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded">
                  entry
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 px-2 shrink-0">
          <Button
            color={BUTTON_COLOR.TRANSPARENT}
            onClick={handleCopyCode}
            title="Copy current file"
            className="h-7 px-2"
          >
            {isCopied ? (
              <Check className="w-3 h-3" />
            ) : (
              <Copy className="w-3 h-3" />
            )}
          </Button>
          <Button
            color={BUTTON_COLOR.TRANSPARENT}
            onClick={() => setIsExpanded(!isExpanded)}
            title={isExpanded ? "Exit fullscreen" : "Fullscreen"}
            className="h-7 px-2"
          >
            {isExpanded ? (
              <Minimize className="w-3 h-3" />
            ) : (
              <Expand className="w-3 h-3" />
            )}
          </Button>
          {!readOnly && canRun && (
            <Button
              color={BUTTON_COLOR.TRANSPARENT}
              className="h-7 px-2"
              onClick={handleRunCode}
              disabled={isRunning}
              loading={isRunning}
              title="Run code"
            >
              {isRunning ? (
                <StopCircle className="w-3.5 h-3.5" />
              ) : (
                <Play className="w-3.5 h-3.5" />
              )}
            </Button>
          )}
        </div>
      </div>

      {/* Editor */}
      <div
        className={
          isExpanded ? "fixed inset-0 z-50 bg-white dark:bg-gray-800" : ""
        }
      >
        {isExpanded && (
          <div className="flex items-center justify-between p-2 bg-gray-100 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {activeFile.name}
            </span>
            <button
              onClick={() => setIsExpanded(false)}
              className="px-3 py-1 text-sm bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 rounded"
            >
              Close
            </button>
          </div>
        )}

        <Editor
          key={`${activeFile.name}-${activeFileIndex}`}
          height={isExpanded ? "calc(100vh - 200px)" : height}
          language={activeLanguage}
          value={activeFile.content}
          onChange={(value) => handleFileChange(value || "")}
          theme={resolvedTheme === "dark" ? "vs-dark" : "light"}
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            lineNumbers: "on",
            scrollBeyondLastLine: false,
            readOnly: readOnly || activeFile.name === "package.json",
            automaticLayout: true,
            tabSize: 2,
            wordWrap: "on",
            formatOnType: true,
            formatOnPaste: true,
          }}
          onMount={(editor) => {
            editorRef.current = editor;
          }}
        />
      </div>

      {/* Console Output */}
      <Console
        result={result}
        isRunning={isRunning}
        forceUpdateCounter={forceUpdateCounter}
        streamingOutput={streamingOutput}
      />
    </div>
  );
};

export default MultiFileCodeEditor;
