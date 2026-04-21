# headless-three-gltf

[GLTFLoader](https://threejs.org/docs/#examples/en/loaders/GLTFLoader) for [headless-three](https://www.npmjs.com/package/headless-three).
Load `.gltf` and `.glb` models on the server with no browser required.
Uses the stock `GLTFLoader`, modified to work with headless-three.

[![npm version](https://badge.fury.io/js/headless-three-gltf.svg)](https://www.npmjs.com/package/headless-three-gltf)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Features

* Stock `GLTFLoader` modified to work with headless-three
* Supports `.gltf`, `.glb`, skinning, morph targets, animations, and KHR extensions
* Convenience `loadGLTF(path)` helper that reads from disk and returns a parsed gltf

## Install

```bash
npm install headless-three-gltf
```

Requires [headless-three](https://www.npmjs.com/package/headless-three) as a peer dependency:

```bash
npm install headless-three
```

## Quick Start

```js
import { Canvas, Image, ImageData } from "skia-canvas"
import getTHREE from "headless-three"
import initGLTF from "headless-three-gltf"

const { THREE, render } = await getTHREE({ Canvas, Image, ImageData })
const { loadGLTF } = initGLTF(THREE)

const gltf = await loadGLTF("path/to/model.gltf")

const scene = new THREE.Scene()
scene.add(gltf.scene)

// Render with headless-three
await render({
  scene,
  camera,
  width: 512,
  height: 512,
  path: "output.png"
})
```

## API

### `initGLTF(THREE)`

Takes the `THREE` object returned by `getTHREE(...)`, wires `GLTFLoader` into its VM context, and returns `{ loadGLTF, GLTFLoader }`. Both are also attached to `THREE.headless` for convenience.

| Returns | Description |
|---|---|
| `loadGLTF(path)` | Reads a `.gltf`/`.glb` from disk and returns a parsed gltf object (`{ scene, scenes, animations, cameras, asset, parser, userData }`) |
| `GLTFLoader` | The raw `GLTFLoader` class from inside the VM, for cases where you need `loader.parse(...)` directly or want to register extension plugins |

### `loadGLTF(path)`

Loads a `.gltf` or `.glb` file from disk. Returns the same parsed object [`GLTFLoader.load`](https://threejs.org/docs/#examples/en/loaders/GLTFLoader) does.

```js
const gltf = await loadGLTF("./model.gltf")
```

### `GLTFLoader`

The stock `GLTFLoader`, modified to work with headless-three. See the [Three.js docs](https://threejs.org/docs/#examples/en/loaders/GLTFLoader) for the full API.

## License

MIT © [Ewan Howell](https://ewanhowell.com/)

Vendors `GLTFLoader.js` and `BufferGeometryUtils.js` from [Three.js](https://github.com/mrdoob/three.js) (MIT, © 2010–2024 three.js authors). See [`vendor/LICENSE`](vendor/LICENSE).
