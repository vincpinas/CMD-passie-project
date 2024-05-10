import * as THREE from "three"
import { GLTFLoader, OrbitControls } from "three/examples/jsm/Addons.js";
import { GainMapDecoderMaterial, HDRJPGLoader, QuadRenderer } from '@monogrid/gainmap-js';
import { ScrollTrigger } from "gsap/ScrollTrigger";
import gsap from "gsap"
import confetti from "canvas-confetti";


export default class Experience {
    hdrUrl: string;
    model: THREE.Group | undefined;
    renderer: THREE.WebGLRenderer;
    camera: THREE.PerspectiveCamera;
    scene: THREE.Scene;
    controls: OrbitControls;
    modelLoader: GLTFLoader
    hdr: hdr | undefined;
    modelInfo: modelInfo;

    constructor(opts: ExperienceOpts) {
        this.hdrUrl = './assets/MR_INT-005_WhiteNeons_NAD.jpg'

        this.modelInfo = opts.modelInfo || null;

        this.renderer = new THREE.WebGLRenderer({ antialias: true, canvas: document.querySelector("#midicanvas") as HTMLCanvasElement, alpha: true });
        this.camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 1, 100);
        this.scene = new THREE.Scene();
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.modelLoader = new GLTFLoader();

        this.init();
    }

    // Setup
    async init() {
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.setSize();
        window.onresize = () => this.setSize();

        this.camera.position.set(5, 2, 10);
        this.camera.rotation.set(-1, 4, 0)

        this.controls.target.set(0, 0.5, 0);
        this.controls.update();
        this.controls.enablePan = false;
        this.controls.enableRotate = false;
        this.controls.enableDamping = true;
        this.controls.enableZoom = false;
        this.controls.minDistance = 9;
        this.controls.maxDistance = 30;

        const pmremGenerator = new THREE.PMREMGenerator(this.renderer);
        pmremGenerator.compileEquirectangularShader();

        this.hdr = await this.getHDR()

        this.scene.environment = this.hdr.hdrJpgEquirectangularMap

        let model = await this.loadModel();

        this.model = model;

        this.scene.add(new THREE.AmbientLight(new THREE.Color(0xFFFFFF), 0.33))

        gsap.registerPlugin(ScrollTrigger)

        this.setupScrollAnimation();

        this.registerEditForm()

        this.render();
    }

    setupScrollAnimation() {
        if (!this.camera || !this.model) return;

        ScrollTrigger.defaults({
            scrub: 0.55,
            start: "top top",
            immediateRender: false
        })

        // Pin canvas timeline
        gsap.timeline({
            scrollTrigger: {
                trigger: ".first",
                endTrigger: ".fifth",
                end: "bottom bottom",
                scrub: 0.2,
                pin: "#canvas-container",
            }
        })

        const toggleControls = (self: any) => {
            if (self.isActive) {
                this.controls.enableRotate = false;
                this.controls.enableZoom = false;
            } else {
                this.controls.enableRotate = true;
                this.controls.enableZoom = true;
            }
        }

        ScrollTrigger.create({
            trigger: ".fourth",
            onLeave: toggleControls,
            onEnterBack: toggleControls,
        })

        // Camera timeline
        gsap.timeline().add("start").to(this.camera.position, {
            x: 1,
            y: 2,
            z: 6,
            scrollTrigger: {
                trigger: ".first",
            }
        }, "start")
            .to(this.camera.rotation, {
                x: 0,
                y: 0,
                z: 6,
                scrollTrigger: {
                    trigger: ".first",
                }
            }, "start")
            .to(this.camera.position, {
                x: 0,
                y: 2,
                z: 10,
                scrollTrigger: {
                    trigger: ".second",
                }
            })
            .to(this.model.rotation, {
                x: -0.2,
                y: 2,
                scrollTrigger: ".second"
            })
            .to(this.camera.position, {
                z: 14,
                scrollTrigger: ".third"
            })
            .to(this.model.rotation, {
                y: 5,
                scrollTrigger: ".third"
            })
            .to(this.model.rotation, {
                y: 4.7,
                x: 0,
                z: 0,
                scrollTrigger: ".fourth"
            })
            .to(this.camera.position, {
                y: 0.5,
                x: 0,
                z: 12,
                scrollTrigger: ".fourth"
            })
            .to(this.model.position, {
                y: 0,
                x: 0,
                z: 0,
                scrollTrigger: ".fourth"
            })
            .to(this.camera.rotation, {
                y: 0,
                x: 0,
                z: 6.3,
                scrollTrigger: ".fourth"
            })
            .to("#canvas-container > span", {
                opacity: 1,
                scrollTrigger: ".fourth"
            })
    }


    registerEditForm() {
        const form: HTMLFormElement | null = document.querySelector("form");
        const button: HTMLButtonElement | null = document.querySelector("form > button");
        const materials: HTMLSelectElement | null = document.querySelector("form select");
        const pedal: HTMLInputElement | null = document.querySelector("form #pedal");

        if (!button || !form || !materials || !pedal) return;

        button.setAttribute("disabled", "true");

        let clicks = 0;
        let lastClick = new Date().getTime();

        button.addEventListener("click", () => {
            clicks++;
            confetti({
                particleCount: (30 + clicks),
                spread: clicks < 60 ? (50 + clicks * 0.8) : 98,
                origin: { x: 0.64, y: 0.57 },
                startVelocity: clicks < 100 ? (20 + clicks) : 120
            });

            lastClick = new Date().getTime();

            let reset = setTimeout(() => {
                let currentTime = new Date().getTime();

                if(currentTime > lastClick + 2000) clicks = 0;
                else(clearTimeout(reset))
            }, 2200)
        })

        form.addEventListener("submit", (e) => { e.preventDefault() })

        const mat_cost: any = {
            wood: 400,
            plastic: 250,
        }

        const formElements = [materials, pedal];

        // Calculate price
        formElements.forEach((el: any) => el.addEventListener("change", () => {
            if (button.hasAttribute("disabled")) button.removeAttribute("disabled");

            let priceEl: HTMLSpanElement | null = document.querySelector(".fifth > p > span");

            if (!priceEl) return;

            const currentPrice = { price: Number(priceEl?.innerHTML) };
            const targetPrice = this.sumArr([
                mat_cost[materials.value],
                pedal?.checked ? 50 : 0,
            ]);

            gsap.to(currentPrice, 0.5, {
                price: targetPrice,
                onUpdate: updateOutput
            })

            function updateOutput() {
                const value = Math.round(currentPrice.price);
                priceEl!.innerText = `${value}`;
            }
        }))
    }


    // Functions
    sumArr(arr: number[]) {
        let sum = 0;
        arr.forEach(num => typeof num === "number" ? sum += num : null);
        return sum;
    }

    setSize() {
        const container = document.querySelector("#canvas-container")

        const width = container?.clientWidth
        const height = container?.clientHeight

        if (!width || !height) return;

        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
    }

    async getHDR(): Promise<hdr> {
        let hdrJpg: QuadRenderer<1016, GainMapDecoderMaterial>, hdrJpgEquirectangularMap: THREE.Texture;

        hdrJpg = new HDRJPGLoader(this.renderer).load(this.hdrUrl, () => {

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

    async loadModel() {
        let modelRef: THREE.Group | undefined = undefined;

        this.modelLoader.load(this.modelInfo.url, (gltf) => {
            const model = gltf.scene;
            model.position.set(
                this.modelInfo.pos.x || 0,
                this.modelInfo.pos.y || 0,
                this.modelInfo.pos.z || 0
            );
            model.scale.set(
                this.modelInfo.scale.x || 1.15,
                this.modelInfo.scale.y || 1,
                this.modelInfo.scale.z || 1.1
            );
            model.rotation.set(
                this.modelInfo.rot.x || 0,
                this.modelInfo.rot.y || -1.09,
                this.modelInfo.rot.z || 0
            )
            model.castShadow = true;
            this.scene.add(model);

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


    render = () => {
        this.renderer.render(this.scene, this.camera);
        requestAnimationFrame(this.render);
    }
}