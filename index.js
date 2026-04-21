import { fileURLToPath } from "node:url"
import path from "node:path"
import fs from "node:fs"

const here = path.dirname(fileURLToPath(import.meta.url))

const bufferUtilsSource = fs.readFileSync(path.join(here, "vendor", "BufferGeometryUtils.js"), "utf8")
const gltfLoaderSource = fs.readFileSync(path.join(here, "vendor", "GLTFLoader.js"), "utf8")

export default function initGLTF(three) {
  const { THREE, runInContext } = three
  const vmGlobal = runInContext("globalThis")

  vmGlobal.THREE = THREE
  runInContext(`{${bufferUtilsSource}}`)
  runInContext(`{${gltfLoaderSource}}`)
  const GLTFLoader = vmGlobal.GLTFLoader

  async function loadGLTF(filepath) {
    const resolved = path.resolve(filepath)
    const json = await fs.promises.readFile(resolved, "utf8")
    const basePath = path.dirname(resolved) + path.sep
    const loader = new GLTFLoader()
    return new Promise((resolve, reject) => {
      loader.parse(json, basePath, resolve, reject)
    })
  }

  three.loadGLTF = loadGLTF
  three.GLTFLoader = GLTFLoader
  return { loadGLTF, GLTFLoader }
}
