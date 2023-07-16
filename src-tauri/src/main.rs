// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::{
    cell::RefCell,
    env,
    fs::{self, DirEntry},
    io,
    path::Path,
    process::Command,
    rc::Rc,
};
use tauri::{Builder, CustomMenuItem, Menu, MenuEntry, Submenu};
// NOTE: I'm actually not sure if tokio is needed for this project.
use tokio::{runtime::Runtime, task};

// NOTE: All the code are in mess and I might not going to refactor it.
fn main() {
    let file_submenu = MenuEntry::Submenu(Submenu::new(
        "&File",
        Menu::with_items([CustomMenuItem::new("Quit", "&Quit").into()]),
    ));

    let menu = Menu::with_items([file_submenu]);

    Builder::default()
        .invoke_handler(tauri::generate_handler![
            pwd,
            get_fs,
            get_parent,
            get_open,
            get_terminal
        ])
        .menu(menu)
        .on_menu_event(|event| match event.menu_item_id() {
            "Quit" => std::process::exit(0),
            _ => (),
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

fn fs_get_full_path(path: &str) -> io::Result<String> {
    let full_path = fs::canonicalize(path).unwrap();
    Ok(full_path.to_string_lossy().into_owned())
}

#[tauri::command]
fn pwd() -> String {
    fs_get_full_path(".").unwrap()
}

fn fs_read_fs(dir: &Path, cb: &dyn Fn(&DirEntry)) -> io::Result<()> {
    for entry in fs::read_dir(dir).unwrap() {
        let entry = entry.unwrap();
        cb(&entry);
    }
    Ok(())
}

#[tauri::command]
fn get_fs(path: &str) -> Vec<String> {
    let result: Rc<RefCell<Vec<String>>> = Rc::new(RefCell::new(Vec::new()));
    fs_read_fs(Path::new(path), &|entry| {
        let path = entry.path();
        let mut r = result.borrow_mut();

        if path.is_dir() {
            r.push(format!(
                "{}/",
                entry.file_name().to_string_lossy().into_owned()
            ));
        } else {
            r.push(entry.file_name().to_string_lossy().into_owned());
        }
    })
    .unwrap();
    Rc::try_unwrap(result).unwrap().into_inner()
}

fn fs_get_parent(path: &str) -> io::Result<String> {
    Ok(match Path::new(path).parent() {
        Some(path) => {
            env::set_current_dir(path).unwrap();
            path.to_string_lossy().into_owned()
        }
        None => path.to_owned(),
    })
}

#[tauri::command]
fn get_parent(path: &str) -> String {
    fs_get_parent(path).unwrap()
}

fn fs_get_open(target: &str) -> io::Result<String> {
    let current_path = pwd();
    let path = Path::new(&current_path).join(target);
    if path.is_dir() {
        env::set_current_dir(path.clone()).unwrap();
        Ok(path.to_string_lossy().into_owned())
    } else {
        let rt = Runtime::new().unwrap();
        rt.block_on(async move {
            task::spawn_blocking(move || {
                // TODO: open with default program on target_os windows
                let mut command = Command::new("sh");
                command
                    .arg("-c")
                    .arg(format!("exec xdg-open {}", path.to_str().unwrap()));
                command.spawn().unwrap();
            })
            .await
            .unwrap();
        });

        Ok(current_path)
    }
}

#[tauri::command]
fn get_open(target: &str) -> String {
    fs_get_open(target).unwrap()
}

fn open_terminal_at_path(path: &str) {
    let path_clone = path.to_owned();
    let rt = Runtime::new().unwrap();
    rt.block_on(async move {
        task::spawn_blocking(move || {
            let mut command: Command;
            if cfg!(target_os = "windows") {
                command = Command::new("cmd");
                command.args(&["/C", "start", "cmd", "/K", "cd", &path_clone])
            } else {
                command = Command::new("sh");
                command
                    .arg("-c")
                    // WARNING: should replace alacritty with something like $TERM or format from
                    // config I'll make some in app preferences in the future
                    .arg(format!("cd {}; exec alacritty", &path_clone))
            };

            command.spawn().unwrap();
        })
        .await
        .unwrap();
    });
}

#[tauri::command]
fn get_terminal(path: &str) {
    open_terminal_at_path(path);
}
