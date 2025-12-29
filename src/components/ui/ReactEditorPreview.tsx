"use client";

import {
  SandpackProvider,
  SandpackLayout,
  SandpackCodeEditor,
  SandpackPreview,
  UnstyledOpenInCodeSandboxButton,
} from "@codesandbox/sandpack-react";
import { useState } from "react";

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
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return (
      <div 
        className="border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden bg-white dark:bg-gray-800"
        style={{ height: `${height}px` }}
      >
        <div className="bg-gray-50 dark:bg-gray-700 px-4 py-2 border-b border-gray-200 dark:border-gray-600 flex items-center justify-between">
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
        <div className="flex flex-col items-center justify-center h-full p-8 text-center">
          <div className="text-4xl mb-4">🔌</div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
            Preview Unavailable
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4 max-w-md">
            The live preview couldn&apos;t load. This might be due to network issues or an ad blocker.
          </p>
          <button
            onClick={() => setHasError(false)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden bg-white dark:bg-gray-800"
      style={{ height: `${height}px` }}
    >
      {/* Header */}
      <div className="bg-gray-50 dark:bg-gray-700 px-4 py-2 border-b border-gray-200 dark:border-gray-600 flex items-center justify-between">
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

      {/* Sandpack Editor & Preview */}
      <div style={{ height: `${height - 48}px` }}>
        <SandpackProvider
          template="react"
          files={{
            "/App.js": initialCode,
          }}
          options={{
            editorHeight: height - 48,
            showNavigator: false,
            showTabs: false,
            showLineNumbers: true,
            showInlineErrors: true,
            wrapContent: true,
            readOnly: !editable,
            initMode: "lazy",
            initModeObserverOptions: { rootMargin: "300px" },
          }}
          theme="auto"
        >
          <SandpackLayout style={{ height: "100%" }}>
            <SandpackCodeEditor style={{ flex: 1 }} />
            <SandpackPreview 
              showOpenInCodeSandbox={false} 
              style={{ flex: 1 }}
              showRefreshButton={true}
              actionsChildren={
                <UnstyledOpenInCodeSandboxButton className="sp-button sp-icon-standalone" title="Open in CodeSandbox">
                  ⬈
                </UnstyledOpenInCodeSandboxButton>
              }
            />
          </SandpackLayout>
        </SandpackProvider>
      </div>
    </div>
  );
}
