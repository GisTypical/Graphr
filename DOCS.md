# Documentation

- [Documentation](#documentation)
- [Electron](#electron)
  - [IPC](#ipc)
- [Structure](#structure)
  - [`src` folder](#src-folder)
  - [`app` folder (using a _modules_ structure)](#app-folder-using-a-modules-structure)
  - [`core` module:](#core-module)
  - [`shared` module (_used in multiple components_):](#shared-module-used-in-multiple-components)
  - [`modules` (submodules - routing)](#modules-submodules---routing)
  - [`assets`](#assets)

# Electron

Al hacer una aplicación de escritorio, generalmente se querrá acceder a funciones que interactúen con el sistema. Esto se puede hacer a partir del proceso `main` el cual contiene *API* nativas que realizan esto. Para ello se tiene que **comunicar** dicho proceso con el proceso `renderer`, donde se encuentra *Angular*. 

## IPC

Dicha comunicación se realiza a través del *IPC* (Inter-Process Comunication):

- **IpcMain**: Maneja la comunicación de procesos desde el `main` (`main` --> App).
- **IpcRenderer**: Maneja la comunicación de procesos a partir del `renderer` (App --> `main`)

Estos contienen métodos como `on` para escuchar por evento o `send` para enviarlo. Por lo que se podría hacer que `IpcRenderer` envíe un evento a `IpcMain` ejecutar alguna función nativa y devolver un resultado *si es el caso*.

Para utilizar el `IpcRenderer`, se tiene un servicio de Angular donde se tiene expuesto y hace que sea accesible a toda la aplicación.

# Structure

## `src` folder

```
- src/
  - app/ (center of code)
  - assets/
  - environments/
```

---

## `app` folder (using a _modules_ structure)

```
- app/
  - core/ (center of the application)
  - modules/ (individual modules)
  - shared/
```

---

## `core` module:

- singleton services
- components necessary for the application (_not shared_, like header or footer)
- models

```
- core/
  - core.module.ts
  - components/
    - header/
      - header.component.[html, css, ts, spec.ts]
  - models/
    - author.models.ts
  - services/
```

---

## `shared` module (_used in multiple components_):

```
- shared/
  - shared.module.ts
  - components/
    - card/
    - primary-button/
  - directives/
  - pipes/
```

---

## `modules` (submodules - routing)

```
- modules/
  - home/
    - home.module.ts
    - home-routing.module.ts
    - components/
    - pages/
    - services/
```

---

## `assets`

```
- assets/
  - styles/
    - fonts/
    - partials/
    - themes/
    - app.scss
  - img/
  - i18n/
```
