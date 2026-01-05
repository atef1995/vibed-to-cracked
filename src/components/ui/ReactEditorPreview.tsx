"use client";

import { LiveProvider, LiveEditor, LiveError, LivePreview } from "react-live";
import { useState, useMemo, useId } from "react";
import {
  AppWindowIcon,
  CodeIcon,
  FileIcon,
  PlusIcon,
  XIcon,
  Maximize2Icon,
  Minimize2Icon,
  PaletteIcon,
} from "lucide-react";
import { useMoodColors } from "@/hooks/useMoodColors";

// Single file interface
interface CodeFile {
  name: string;
  code: string;
  isUserCreated?: boolean;
  language?: "jsx" | "css"; // Auto-detected from extension if not provided
}

// Helper to detect file type from extension
const getFileLanguage = (fileName: string): "jsx" | "css" => {
  if (fileName.endsWith(".css")) return "css";
  return "jsx";
};

// Helper to get file icon based on type
const getFileIcon = (fileName: string) => {
  if (fileName.endsWith(".css")) return PaletteIcon;
  return FileIcon;
};

interface ReactEditorPreviewProps {
  // Single file mode (backward compatible)
  initialCode?: string;
  // Multi-file mode
  files?: CodeFile[];
  title?: string;
  height?: number;
  editable?: boolean;
  showConsole?: boolean;
  allowAddFiles?: boolean;
}

export function ReactEditorPreview({
  initialCode,
  files,
  title = "React Editor & Preview",
  height = 700,
  editable = true,
  allowAddFiles = true,
}: ReactEditorPreviewProps) {
  const [activeTab, setActiveTab] = useState<"code" | "preview">("preview");
  const [isExpanded, setIsExpanded] = useState(false);
  const currentMood = useMoodColors();
  const styleId = useId();

  // Calculate current height based on expanded state
  const expandedHeight = Math.max(height * 1.5, 800);

  // User-created files
  const [userFiles, setUserFiles] = useState<CodeFile[]>([]);
  const [isAddingFile, setIsAddingFile] = useState(false);
  const [newFileName, setNewFileName] = useState("");

  // Convert single file to files array for unified handling
  const baseFiles = useMemo(() => {
    if (files && files.length > 0) {
      return files;
    }
    if (initialCode) {
      return [{ name: "App.jsx", code: initialCode }];
    }
    return [{ name: "App.jsx", code: "// No code provided" }];
  }, [files, initialCode]);

  // Combine base files with user-created files
  const codeFiles = useMemo(() => {
    return [...baseFiles, ...userFiles];
  }, [baseFiles, userFiles]);

  const [activeFileIndex, setActiveFileIndex] = useState(0);
  const [editedFiles, setEditedFiles] = useState<Record<number, string>>({});

  // Add new file
  const handleAddFile = () => {
    if (!newFileName.trim()) return;

    let fileName = newFileName.trim();
    // Only add extension if none is present
    if (!fileName.includes(".")) {
      fileName += ".jsx";
    }

    // Check for duplicate names
    if (
      codeFiles.some((f) => f.name.toLowerCase() === fileName.toLowerCase())
    ) {
      alert("A file with this name already exists!");
      return;
    }

    const isCssFile = fileName.endsWith(".css");
    const newFile: CodeFile = {
      name: fileName,
      code: isCssFile
        ? `/* ${fileName} */\n\n.container {\n  padding: 20px;\n}\n`
        : `// ${fileName}\nfunction ${fileName.replace(
            /\.(jsx|js)$/,
            ""
          )}() {\n  return (\n    <div>\n      {/* Your code here */}\n    </div>\n  );\n}`,
      isUserCreated: true,
      language: isCssFile ? "css" : "jsx",
    };

    setUserFiles((prev) => [...prev, newFile]);
    setActiveFileIndex(codeFiles.length); // Switch to new file
    setNewFileName("");
    setIsAddingFile(false);
  };

  // Delete user-created file
  const handleDeleteFile = (index: number) => {
    const file = codeFiles[index];
    if (!file.isUserCreated) return; // Can't delete original files

    const userFileIndex = index - baseFiles.length;
    setUserFiles((prev) => prev.filter((_, i) => i !== userFileIndex));

    // Clean up edited content for this file
    setEditedFiles((prev) => {
      const newEdited = { ...prev };
      delete newEdited[index];
      // Reindex files after deleted one
      const reindexed: Record<number, string> = {};
      Object.entries(newEdited).forEach(([key, value]) => {
        const keyNum = parseInt(key);
        if (keyNum > index) {
          reindexed[keyNum - 1] = value;
        } else {
          reindexed[keyNum] = value;
        }
      });
      return reindexed;
    });

    // Adjust active index if needed
    if (activeFileIndex >= index) {
      setActiveFileIndex(Math.max(0, activeFileIndex - 1));
    }
  };

  // Clean up code - remove imports/exports for react-live
  // isMainFile determines if we should add render() call
  const cleanCode = (code: string, isMainFile: boolean = false) => {
    let cleaned = code
      .replace(/import\s+.*?from\s+['"].*?['"];?\s*\n?/g, "")
      .replace(/export\s+default\s+/g, "")
      .replace(/export\s+/g, "")
      .trim();

    // Only add render() to the main file (App.jsx or file with existing render)
    if (isMainFile && !cleaned.includes("render(")) {
      const componentMatch = cleaned.match(/function\s+(\w+)\s*\(/);
      if (componentMatch) {
        const componentName = componentMatch[1];
        cleaned = cleaned + `\n\nrender(<${componentName} />);`;
      }
    }

    return cleaned;
  };

  // Find the main entry file (App.jsx or file containing render())
  const findMainFileIndex = () => {
    // First, check if any file already has render()
    for (let i = 0; i < codeFiles.length; i++) {
      const code = editedFiles[i] ?? codeFiles[i].code;
      if (
        code.includes("render(") &&
        getFileLanguage(codeFiles[i].name) === "jsx"
      )
        return i;
    }
    // Otherwise, look for App.jsx
    const appIndex = codeFiles.findIndex(
      (f) =>
        f.name.toLowerCase() === "app.jsx" || f.name.toLowerCase() === "app.js"
    );
    return appIndex >= 0 ? appIndex : codeFiles.length - 1; // fallback to last file
  };

  // Extract combined CSS from all CSS files
  const combinedCss = useMemo(() => {
    const getFileCode = (index: number) =>
      editedFiles[index] ?? codeFiles[index].code;

    return codeFiles
      .map((file, index) => ({ file, code: getFileCode(index) }))
      .filter(({ file }) => getFileLanguage(file.name) === "css")
      .map(({ code }) => code)
      .join("\n\n");
  }, [codeFiles, editedFiles]);

  // Combine all JSX files for execution (multi-file mode)
  const combinedCode = useMemo(() => {
    const getFileCode = (index: number) =>
      editedFiles[index] ?? codeFiles[index].code;

    // Filter to only JSX files
    const jsxFiles = codeFiles
      .map((file, index) => ({ file, index, code: getFileCode(index) }))
      .filter(({ file }) => getFileLanguage(file.name) === "jsx");

    if (jsxFiles.length === 0) {
      return "// No JSX files";
    }

    if (jsxFiles.length === 1) {
      return cleanCode(jsxFiles[0].code, true);
    }

    const mainFileIndex = findMainFileIndex();

    // Combine all files: helper components first, main file last
    // This ensures components are defined before they're used in App
    const helperFiles = jsxFiles
      .filter(({ index }) => index !== mainFileIndex)
      .map(({ code }) => cleanCode(code, false));

    const mainFileEntry = jsxFiles.find(({ index }) => index === mainFileIndex);
    const mainFile = mainFileEntry ? cleanCode(mainFileEntry.code, true) : "";

    return [...helperFiles, mainFile].join("\n\n");
  }, [codeFiles, editedFiles]);

  const isMultiFile = codeFiles.length > 1;

  return (
    <div
      className="border dark:border-gray-600 rounded-lg overflow-hidden transition-all duration-300 ease-in-out"
      style={{ height: `${isExpanded ? expandedHeight : height}px` }}
    >
      {/* Header */}
      <div
        className={`${currentMood.bg} px-4 py-2 dark:border-gray-600 flex items-center justify-between`}
      >
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
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-1.5 rounded-md text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
          title={isExpanded ? "Collapse editor" : "Expand editor"}
        >
          {isExpanded ? (
            <Minimize2Icon size={16} />
          ) : (
            <Maximize2Icon size={16} />
          )}
        </button>
      </div>

      {/* Main Tabs (Code/Preview) */}
      <div
        className={`${currentMood.bg} dark:bg-gray-750 px-2 py-1 border-b border-gray-200 dark:border-gray-600 flex gap-1`}
      >
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

      {/* File Tabs (only in code view with multiple files or when adding is allowed) */}
      {activeTab === "code" && (isMultiFile || allowAddFiles) && (
        <div className="bg-gray-800 px-2 py-1 flex gap-0.5 overflow-x-auto border-b border-gray-700 items-center">
          {codeFiles.map((file, index) => {
            const IconComponent = getFileIcon(file.name);
            return (
              <button
                key={`${file.name}-${index}`}
                onClick={() => setActiveFileIndex(index)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-all rounded-t-md group ${
                  activeFileIndex === index
                    ? "bg-gray-900 text-white border-t border-x border-gray-600"
                    : "text-gray-400 hover:text-gray-200 hover:bg-gray-700/50"
                }`}
              >
                <IconComponent size={12} />
                {file.name}
                {editedFiles[index] !== undefined && (
                  <span
                    className="w-2 h-2 rounded-full bg-yellow-500"
                    title="Modified"
                  />
                )}
                {file.isUserCreated && (
                  <span
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteFile(index);
                    }}
                    className="ml-1 opacity-0 group-hover:opacity-100 hover:text-red-400 transition-opacity"
                    title="Delete file"
                  >
                    <XIcon size={12} />
                  </span>
                )}
              </button>
            );
          })}

          {/* Add File Button / Input */}
          {allowAddFiles && editable && (
            <>
              {isAddingFile ? (
                <div className="flex items-center gap-1 ml-1">
                  <input
                    type="text"
                    value={newFileName}
                    onChange={(e) => setNewFileName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleAddFile();
                      if (e.key === "Escape") {
                        setIsAddingFile(false);
                        setNewFileName("");
                      }
                    }}
                    placeholder="filename.jsx or .css"
                    className="px-2 py-1 text-xs bg-gray-900 border border-gray-600 rounded text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 w-36"
                    autoFocus
                  />
                  <button
                    onClick={handleAddFile}
                    className="p-1 text-green-400 hover:text-green-300"
                    title="Create file"
                  >
                    <PlusIcon size={14} />
                  </button>
                  <button
                    onClick={() => {
                      setIsAddingFile(false);
                      setNewFileName("");
                    }}
                    className="p-1 text-gray-400 hover:text-gray-300"
                    title="Cancel"
                  >
                    <XIcon size={14} />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setIsAddingFile(true)}
                  className="inline-flex items-center gap-1 px-2 py-1.5 text-xs text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-md transition-all ml-1"
                  title="Add new file"
                >
                  <PlusIcon size={14} />
                </button>
              )}
            </>
          )}
        </div>
      )}

      {/* Content */}
      <div
        style={{
          height: `${
            (isExpanded ? expandedHeight : height) -
            ((isMultiFile || allowAddFiles) && activeTab === "code" ? 122 : 90)
          }px`,
        }}
        className="overflow-hidden transition-all duration-300 ease-in-out"
      >
        {activeTab === "code" ? (
          <div className="h-full overflow-auto bg-gray-900">
            {/* Show current file's code for editing */}
            <LiveProvider
              key={`editor-${activeFileIndex}`}
              code={
                editedFiles[activeFileIndex] ?? codeFiles[activeFileIndex].code
              }
              noInline={true}
            >
              <LiveEditor
                disabled={!editable}
                className="!font-mono !text-sm !bg-gray-900 !min-h-full"
                style={{
                  fontFamily:
                    'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace',
                  fontSize: "14px",
                  backgroundColor: "#1e1e1e",
                  minHeight: "100%",
                }}
                onChange={(newCode) => {
                  if (editable) {
                    setEditedFiles((prev) => ({
                      ...prev,
                      [activeFileIndex]: newCode,
                    }));
                  }
                }}
              />
            </LiveProvider>
          </div>
        ) : (
          <div className="h-full overflow-auto bg-white dark:bg-gray-900 p-4">
            {/* Inject CSS styles with scoped ID */}
            {combinedCss && (
              <style
                dangerouslySetInnerHTML={{
                  __html: combinedCss.replace(
                    /([.#]?[\w-]+)\s*\{/g,
                    (match, selector) => {
                      // Scope all selectors to this preview instance
                      if (
                        selector.startsWith(".") ||
                        selector.startsWith("#")
                      ) {
                        return `[data-preview-id="${styleId}"] ${selector} {`;
                      }
                      // Handle element selectors
                      return `[data-preview-id="${styleId}"] ${match}`;
                    }
                  ),
                }}
              />
            )}
            {/* Use combined code for preview execution */}
            <LiveProvider code={combinedCode} noInline={true}>
              <LiveError className="text-red-500 bg-red-50 dark:bg-red-900/20 p-3 rounded-md mb-4 text-sm font-mono" />
              <div data-preview-id={styleId}>
                <LivePreview className="react-live-preview" />
              </div>
            </LiveProvider>
          </div>
        )}
      </div>
    </div>
  );
}
