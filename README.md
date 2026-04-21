# headless-three-gltf

[GLTFLoader](https://threejs.org/docs/#examples/en/loaders/GLTFLoader) for [headless-three](https://www.npmjs.com/package/headless-three).
Load `.gltf` and `.glb` models on the server with no browser required.
Uses the stock Three.js r162 `GLTFLoader`, adapted to run inside headless-three's isolated VM context.

[![npm version](https://badge.fury.io/js/headless-three-gltf.svg)](https://www.npmjs.com/package/headless-three-gltf)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Features

* Stock Three.js r162 `GLTFLoader` running inside headless-three's VM
* No global scope pollution
* Supports `.gltf`, `.glb`, skinning, morph targets, animations, and KHR extensions
* Convenience `loadGLTF(path)` helper that reads from disk and returns a parsed gltf

## Install

```bash
npm install headless-three-gltf
```

Requires [headless-three](https://www.npmjs.com/package/headless-three) `^1.5.0` as a peer dependency:

```bash
npm install headless-three
```

## Quick Start

```js
import { Canvas, Image, ImageData } from "skia-canvas"
import getTHREE from "headless-three"
import initGLTF from "headless-three-gltf"

const three = await getTHREE({ Canvas, Image, ImageData })
const { loadGLTF } = initGLTF(three)

const gltf = await loadGLTF("path/to/model.gltf")

const scene = new THREE.Scene()
scene.add(gltf.scene)

// Render with headless-three
await three.render({
  scene,
  camera,
  width: 512,
  height: 512,
  path: "output.png"
})
```

## API

### `initGLTF(three)`

Takes the object returned by `getTHREE(...)`, wires `GLTFLoader` into its VM context, and returns `{ loadGLTF, GLTFLoader }`. Both are also attached to the passed-in `three` object for convenience.

| Returns | Description |
|---|---|
| `loadGLTF(path)` | Reads a `.gltf`/`.glb` from disk and returns a parsed gltf object (`{ scene, scenes, animations, cameras, asset, parser, userData }`) |
| `GLTFLoader` | The raw `GLTFLoader` class from inside the VM, for cases where you need `loader.parse(...)` directly or want to register extension plugins |

### `loadGLTF(path)`

Loads a `.gltf` or `.glb` file from disk.

```js
const gltf = await loadGLTF("./model.gltf")
gltf.scene       // THREE.Group
gltf.animations  // THREE.AnimationClip[]
```

Relative paths resolve against the current working directory. Absolute paths are used as-is. Under the hood this reads the file with `fs` and hands the contents to `GLTFLoader.parse(...)`, so no `fetch` is involved for the top-level file.

Relative URIs referenced inside the gltf (external `.bin` files, textures) resolve against the directory of the source file and load via the VM's `fetch`. Embedded `data:` URIs work out of the box. Loading external files over `file://` is not supported — either embed them or replace the materials/textures after load.

### `GLTFLoader`

The same class the Three.js docs describe, loaded inside headless-three's VM so it shares class identity with `three.THREE`. Use it directly if you need more control than `loadGLTF` offers:

```js
const { GLTFLoader } = initGLTF(three)
const loader = new GLTFLoader()
loader.register(parser => new MyCustomExtension(parser))

loader.parse(jsonString, basePath, gltf => {
  // ...
}, err => {
  // ...
})
```

## How It Works

headless-three-gltf vendors the stock `GLTFLoader.js` and `BufferGeometryUtils.js` from Three.js r162, with their ESM `import`/`export` lines swapped for a `THREE` global lookup and a `globalThis` assignment. `initGLTF(three)` exposes `THREE` on the VM, runs each vendor file as a script via `runInContext`, and plucks the resulting `GLTFLoader` class back out. Because the loader runs inside the same VM as Three.js, it produces objects that match `three.THREE`'s class identities — no cross-realm `instanceof` issues.

## License

MIT © [Ewan Howell](https://ewanhowell.com/)

Vendors `GLTFLoader.js` and `BufferGeometryUtils.js` from [Three.js](https://github.com/mrdoob/three.js) (MIT, © 2010–2024 three.js authors). See [`vendor/LICENSE`](vendor/LICENSE).
