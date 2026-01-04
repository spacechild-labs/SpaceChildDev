import { useEffect, useRef } from "react";
import Editor, { OnMount } from "@monaco-editor/react";
import { useProjectContext } from "@/contexts/ProjectContext";
import { getFileLanguage } from "@/lib/utils";

export function MonacoEditor() {
  const { currentFile, fileContent, updateFileContent } = useProjectContext();
  const editorRef = useRef<any>(null);

  const handleEditorMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;
    
    // Configure editor theme
    monaco.editor.defineTheme("spacechilddev", {
      base: "vs-dark",
      inherit: true,
      rules: [],
      colors: {
        "editor.background": "#0a0a0a",
        "editor.foreground": "#fafafa",
        "editorCursor.foreground": "#00d4ff",
        "editor.lineHighlightBackground": "#1a1a1a",
        "editorLineNumber.foreground": "#666666",
        "editor.selectionBackground": "#00d4ff33",
        "editor.inactiveSelectionBackground": "#00d4ff1a",
      },
    });
    monaco.editor.setTheme("spacechilddev");
  };

  const handleChange = (value: string | undefined) => {
    if (value !== undefined) {
      updateFileContent(value);
    }
  };

  const language = currentFile ? getFileLanguage(currentFile.filePath) : "plaintext";

  return (
    <Editor
      height="100%"
      language={language}
      value={fileContent}
      onChange={handleChange}
      onMount={handleEditorMount}
      options={{
        fontSize: 14,
        fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
        fontLigatures: true,
        minimap: { enabled: true, scale: 1 },
        scrollBeyondLastLine: false,
        lineNumbers: "on",
        renderLineHighlight: "all",
        cursorBlinking: "smooth",
        cursorSmoothCaretAnimation: "on",
        smoothScrolling: true,
        tabSize: 2,
        wordWrap: "on",
        automaticLayout: true,
        padding: { top: 16 },
        bracketPairColorization: { enabled: true },
        guides: { bracketPairs: true },
      }}
      loading={
        <div className="h-full flex items-center justify-center text-muted-foreground">
          Loading editor...
        </div>
      }
    />
  );
}
