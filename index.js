import { fileURLToPath } from "node:url"
import path from "node:path"
import fs from "node:fs"

const here = path.dirname(fileURLToPath(import.meta.url))

const bufferUtilsSource = fs.readFileSync(path.join(here, "vendor", "BufferGeometryUtils.js"), "utf8")
const gltfLoaderSource = fs.readFileSync(path.join(here, "vendor", "GLTFLoader.js"), "utf8")

const mimeTypes = {
  ".bin": "application/octet-stream",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".ktx2": "image/ktx2",
  ".basis": "image/basis"
}

export default function initGLTF(THREE) {
  const { runInContext } = THREE.headless
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
    loader.manager.setURLModifier(url => {
      if (/^(data|https?|blob):/i.test(url)) return url
      const filePath = url.startsWith("file://") ? fileURLToPath(url) : url
      const buf = fs.readFileSync(filePath)
      const mime = mimeTypes[path.extname(filePath).toLowerCase()] ?? "application/octet-stream"
      return `data:${mime};base64,${buf.toString("base64")}`
    })
    return new Promise((resolve, reject) => {
      loader.parse(json, basePath, resolve, reject)
    })
  }

  THREE.headless.loadGLTF = loadGLTF
  THREE.headless.GLTFLoader = GLTFLoader
  return { loadGLTF, GLTFLoader }
}
