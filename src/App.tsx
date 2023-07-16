import { useEffect, useState } from "react";

import { FsContent, invokePwd, invokeGetFs } from "./components/api";
import FsSection from "./components/fs-section";

function App() {
  const [currentPath, setCurrentPath] = useState(".");
  const [fs, setFs] = useState<FsContent[]>([]);
  const [pathFs, setPathFs] = useState<FsContent[]>([]);
  const [prevFs, setPrevFs] = useState<FsContent>({
    name: "",
    select: false,
  });

  useEffect(() => {
    invokePwd(setCurrentPath, setPathFs);
  }, []);

  useEffect(() => {
    invokeGetFs(currentPath, setFs, prevFs);
  }, [currentPath, prevFs]);

  useEffect(() => {
    const content = document.getElementsByClassName("fs-content-selected");
    if (content.length > 0) {
      content[0].scrollIntoView({
        block: "nearest",
      });
    }
  }, [fs]);

  return (
    <main className="min-w-full">
      <div id="main-view">
        <FsSection
          currentPath={currentPath}
          setCurrentPath={setCurrentPath}
          fs={fs}
          setFs={setFs}
          pathFs={pathFs}
          setPathFs={setPathFs}
          prevFs={prevFs}
          setPrevFs={setPrevFs}
        />
      </div>
      <div
        id="fs-line"
        className="fixed bottom-0 left-0"
      >
        {currentPath}
      </div>
    </main>
  );
}

export default App;
