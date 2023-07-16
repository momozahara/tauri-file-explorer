import { useEffect, Dispatch, SetStateAction, MouseEvent } from "react";

import {
  FsContent,
  invokeGetOpen,
  invokeGetParent,
  invokeGetTerminal,
} from "./api";

type SectionProps = {
  currentPath: string;
  setCurrentPath: Dispatch<SetStateAction<string>>;
  fs: FsContent[];
  setFs: Dispatch<SetStateAction<FsContent[]>>;
  pathFs: FsContent[];
  setPathFs: Dispatch<SetStateAction<FsContent[]>>;
  prevFs: FsContent;
  setPrevFs: Dispatch<SetStateAction<FsContent>>;
};

function Section({
  currentPath,
  setCurrentPath,
  fs,
  setFs,
  pathFs,
  setPathFs,
  // prevFs,
  setPrevFs,
}: SectionProps) {
  useEffect(() => {
    function navigationDown() {
      let fsSelectResult = fs.findIndex((_fs) => {
        return _fs.select === true;
      });
      if (fsSelectResult < 0) {
        setFs(
          fs.map((_fs, index) => {
            return {
              name: _fs.name,
              select: index === 0,
            };
          }),
        );
      } else {
        setFs(
          fs.map((_fs, index) => {
            return {
              name: _fs.name,
              select: index === fsSelectResult + 1,
            };
          }),
        );
      }
    }

    function navigationUp() {
      let fsSelectResult = fs.findIndex((_fs) => {
        return _fs.select === true;
      });
      if (fsSelectResult < 0) {
        setFs(
          fs.map((_fs, index) => {
            return {
              name: _fs.name,
              select: index === fs.length - 1,
            };
          }),
        );
      } else {
        setFs(
          fs.map((_fs, index) => {
            return {
              name: _fs.name,
              select: index === fsSelectResult - 1,
            };
          }),
        );
      }
    }

    function globalKeyEvent(event: KeyboardEvent) {
      const code = event.code;
      switch (code.toLowerCase()) {
        case "keyt":
        case "f4": {
          invokeGetTerminal(currentPath);
          break;
        }
        case "keyj":
        case "arrowdown": {
          event.preventDefault();
          navigationDown();
          break;
        }
        case "keyk":
        case "arrowup": {
          event.preventDefault();
          navigationUp();
          break;
        }
        case "keyh":
        case "arrowleft": {
          event.preventDefault();
          const _prevFs = pathFs.pop();
          setPrevFs(_prevFs!);
          setPathFs(pathFs);
          invokeGetParent(currentPath, setCurrentPath);
          break;
        }
        case "keyl":
        case "arrowright":
        case "enter": {
          event.preventDefault();
          const fsSelectResult = fs.findIndex((_fs) => {
            return _fs.select === true;
          });
          if (fsSelectResult >= 0) {
            fsSelect(fs[fsSelectResult]);
          }
          break;
        }
      }
    }
    window.addEventListener("keydown", globalKeyEvent);

    return () => {
      window.removeEventListener("keydown", globalKeyEvent);
    };
  }, [fs, currentPath]);

  function onFsContentClick(event: MouseEvent<HTMLElement>, f: FsContent) {
    event.preventDefault();
    setFs(
      fs.map((_f) => {
        return {
          name: _f.name,
          select: _f.name === f.name,
        };
      }),
    );
  }

  function onFsContentDoubleClick(
    event: MouseEvent<HTMLElement>,
    f: FsContent,
  ) {
    event.preventDefault();
    fsSelect(f);
  }

  function fsSelect(f: FsContent) {
    const key = f.name;
    switch (key) {
      case "..": {
        const _prevFs = pathFs.pop();
        setPrevFs(_prevFs!);
        setPathFs(pathFs);
        invokeGetParent(currentPath, setCurrentPath);
        break;
      }
      default: {
        const keyTrail = key[key.length - 1];
        if (keyTrail === "/") {
          pathFs.push({
            name: key.substring(0, key.length - 1),
            select: false,
          });
        }
        invokeGetOpen(key, setCurrentPath);
        break;
      }
    }
  }

  return (
    <section id="fs-section">
      {fs.map((f, index) => {
        return (
          <span
            key={`${index}`}
            data-key={f.name}
            data-index={index}
            className={`fs-content p-2 block ${
              f.select && "fs-content-selected"
            }`}
            onClick={(event) => onFsContentClick(event, f)}
            onDoubleClick={(event) => onFsContentDoubleClick(event, f)}
          >
            <span>{f.name}</span>
          </span>
        );
      })}
    </section>
  );
}

export default Section;
