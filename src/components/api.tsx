import { invoke } from "@tauri-apps/api/tauri";
import React from "react";

export type FsContent = {
  name: string;
  select: boolean;
};

export async function invokePwd(
  setCurrentPath: React.Dispatch<React.SetStateAction<string>>,
  setPathFs: React.Dispatch<React.SetStateAction<FsContent[]>>,
) {
  const _currentPath: string = await invoke("pwd");
  const _pathFs: FsContent[] = _currentPath.split("/").map((c) => {
    return {
      name: c,
      select: false,
    };
  });
  setCurrentPath(_currentPath);
  setPathFs(_pathFs);
}
export async function invokeGetFs(
  currentPath: string,
  setFs: React.Dispatch<React.SetStateAction<FsContent[]>>,
  prevFs?: FsContent,
) {
  let fsLists: string[] = await invoke("get_fs", {
    path: currentPath,
  });
  fsLists.unshift("..");

  setFs(
    fsLists.map((f) => {
      if (prevFs !== undefined) {
        if (f === prevFs.name + "/") {
          return {
            name: f,
            select: true,
          };
        }
      }
      return {
        name: f,
        select: false,
      };
    }),
  );
}
export async function invokeGetParent(
  currentPath: string,
  setCurrentPath: React.Dispatch<React.SetStateAction<string>>,
) {
  setCurrentPath(
    await invoke("get_parent", {
      path: currentPath,
    }),
  );
}
export async function invokeGetOpen(
  target: string,
  setCurrentPath: React.Dispatch<React.SetStateAction<string>>,
) {
  setCurrentPath(
    await invoke("get_open", {
      target: target,
    }),
  );
}

export async function invokeGetTerminal(currentPath: string) {
  await invoke("get_terminal", {
    path: currentPath,
  });
}
