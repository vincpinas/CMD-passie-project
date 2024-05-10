import "./scss/style.scss"
import * as THREE from "three"
import { GLTFLoader, OrbitControls } from "three/examples/jsm/Addons.js";
import { GainMapDecoderMaterial, HDRJPGLoader, QuadRenderer } from '@monogrid/gainmap-js';
import Menu from "./Menu";

const menu = new Menu();

const hdrUrl = './assets/MR_INT-005_WhiteNeons_NAD.jpg'

const modelInfo = {
    url: "./assets/midi/scene.gltf",
    pos: { x: 0, y: 0, z: 0 },
    scale: { x: 1.15, y: 1, z: 1.1 },
    rot: { x: 0, y: -1.09, z: 0 }
}

const renderer = new THREE.WebGLRenderer({ antialias: true, canvas: document.querySelector("#midicanvas") as HTMLCanvasElement, alpha: true });
const camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 1, 100);
const scene = new THREE.Scene();
const controls = new OrbitControls(camera, renderer.domElement);
const modelLoader = new GLTFLoader();

const setSize = (camera: THREE.PerspectiveCamera, renderer: THREE.WebGLRenderer) => {
    const container = document.querySelector("#canvas-container")

    const width = container?.clientWidth
    const height = container?.clientHeight

    if (!width || !height) return;

    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
}

async function getHDR(): Promise<hdr> {
    let hdrJpg: QuadRenderer<1016, GainMapDecoderMaterial>, hdrJpgEquirectangularMap: THREE.Texture;

    hdrJpg = new HDRJPGLoader(renderer).load(hdrUrl, () => {

        hdrJpgEquirectangularMap = hdrJpg.renderTarget.texture;

        hdrJpgEquirectangularMap.mapping = THREE.EquirectangularReflectionMapping;
        hdrJpgEquirectangularMap.needsUpdate = true;

        hdrJpg.dispose();
    })

    let promise = new Promise<hdr>((resolve) => {
        let interval = setInterval(() => {
            if (typeof hdrJpgEquirectangularMap === 'undefined' || typeof hdrJpg === 'undefined') return;
            else {
                clearInterval(interval);
                resolve({ hdrJpgEquirectangularMap, hdrJpg })
            }
        }, 100)
    })

    return await promise;
}

async function loadModel() {
    let modelRef: THREE.Group | undefined = undefined;

    modelLoader.load(modelInfo.url, (gltf) => {
        const model = gltf.scene;
        model.position.set(
            modelInfo.pos.x || 0,
            modelInfo.pos.y || 0,
            modelInfo.pos.z || 0
        );
        model.scale.set(
            modelInfo.scale.x || 1.15,
            modelInfo.scale.y || 1,
            modelInfo.scale.z || 1.1
        );
        model.rotation.set(
            modelInfo.rot.x || 0,
            modelInfo.rot.y || -1.09,
            modelInfo.rot.z || 0
        )
        model.castShadow = true;
        scene.add(model);

        modelRef = model
    })

    let promise = new Promise<THREE.Group<THREE.Object3DEventMap>>((resolve) => {
        let interval = setInterval(() => {
            if (typeof modelRef === 'undefined') return;
            else {
                clearInterval(interval);
                resolve(modelRef)
            }
        }, 100)
    })

    return await promise;
}

renderer.setPixelRatio(window.devicePixelRatio);
setSize(camera, renderer);
window.onresize = () => setSize(camera, renderer);

camera.position.set(5, 2, 10);
camera.rotation.set(-1, 4, 0)

controls.target.set(0, 0.5, 0);
controls.update();
controls.enablePan = true;
controls.enableRotate = false;
controls.enableDamping = true;
controls.enableZoom = false;
controls.minDistance = 9;
controls.maxDistance = 30;
controls.autoRotate = true;

const pmremGenerator = new THREE.PMREMGenerator(renderer);
pmremGenerator.compileEquirectangularShader();

const hdr = await getHDR()

scene.environment = hdr.hdrJpgEquirectangularMap

const model = await loadModel();

scene.add(new THREE.AmbientLight(new THREE.Color(0xFFFFFF), 0.33))

const angles = [
    { 
        position: { x: 7, y: 7, z: 5},
        zoom: 4
    },
    { 
        position: { x: 20, y: 3, z: 1},
        zoom: 10
    },
    { 
        position: { x: -12, y: -3, z: 10},
        zoom: 3
    },
    { 
        position: { x: 3, y: 2, z: 10},
        zoom: 1
    },
]

let currentAngle = 0;
const maxAngle = angles.length - 1;

const applyAngles = () => {
    const currentAnglePos = angles[currentAngle].position;
    const currentAngleZoom = angles[currentAngle].zoom;

    camera.position.set(currentAnglePos.x, currentAnglePos.y, currentAnglePos.z)
    camera.zoom = currentAngleZoom;
    currentAngle < maxAngle ? currentAngle += 1 : currentAngle = 0;
}

const updateModel = () => {
    model.rotation.y += 0.0001
}

const render = () => {
    updateModel();
    controls.update();
    renderer.render(scene, camera);
    requestAnimationFrame(render);
}

setInterval(applyAngles, 3000)

render();

const greetingEl = document.querySelector("#greeting p")
const startButton = document.querySelector("#greeting button")

const greeting = () => {
    const hours = new Date().getHours();

    if(hours > 18) {
        return menu.lang == "en" ? "Good evening" : "Goedenavond"
    } else if(hours < 18 && hours > 12) {
        return menu.lang == "en" ? "Good afternoon" : "Goedemiddag"
    } else {
        return menu.lang == "en" ? "Good morning" : "Goedemorgen"
    }
}

greetingEl!.innerHTML = greeting();

menu.langModal?.childNodes.forEach(child => {
    child.addEventListener("click", () => {
        greetingEl!.innerHTML = greeting();
    })
})

startButton?.addEventListener("click", () => {
    const loading = document.querySelector(".loading");

    loading?.classList.remove("hidden")

    setTimeout(() => {
        document.location.href = "/showcase"
    }, 700)
})