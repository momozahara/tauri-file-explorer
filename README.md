# File Explorer

A simple file explorer design to focus on control, navigation using keyboard with simple design no navigation pane/button

# Control

| KeyBinds                 | Function                 |
| -                        | -                        |
| `J` `ArrowDown`          | Navigate Down            |
| `K` `ArrowUp`            | Navigate Up              |
| `H` `ArrowLeft`          | Go Back To Parent Folder |
| `L` `ArrowRight` `Enter` | Open File / Open Folder  |
| `T` `F4`                 | Open Terminal            |

## Road Map

- File / Folder Search
- Bookmarks
- Preferences
- Folder File Icon
- Image Preview

*** The current state of application is pretty much unusable like there is no preferences to change terminal to open with `F4` Keybind unless you have to get into file [`main.rs#L141`](/src-tauri/src/main.rs#L141) to edit from `alacritty` to the one you use.

*** This is just a project to learn tauri so there is a possibility that I will abandon this project.
