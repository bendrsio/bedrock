import React, { useState, useCallback } from "react";
import { createRoot } from "react-dom/client";
import Editor from "./components/editor";
import { EditorView } from "../shared/types";
import { EditorController } from "./controllers/EditorController";
import { LinesModel } from "./models/LinesModel";

const App = () => {
  const [controller, setController] = useState<EditorController | null>(null);
  const [model] = useState(() => new LinesModel(""));

  const editorRef = useCallback(
    (editorView: EditorView | null) => {
      if (editorView && !controller) {
        const newController = new EditorController(model, editorView);
        setController(newController);
      }
    },
    [controller]
  );

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Editor
        ref={editorRef}
        onKeyDown={controller?.handleKeyDown}
        model={model}
        // onSelectionChange={controller?.handleCursorChange}
      />
    </div>
  );
};

const rootElement = document.getElementById("root");
if (rootElement) {
  const root = createRoot(rootElement);
  root.render(<App />);
}
