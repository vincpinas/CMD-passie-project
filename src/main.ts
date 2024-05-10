import "./scss/style.scss"
import Experience from "./Experience";
import Loader from "./Loader";
import Menu from "./Menu";

const loader = new Loader()

const midi = new Experience({
    modelInfo: {
        url: "./assets/midi/scene.gltf",
        pos: { x: 0, y: 0, z: 0 },
        scale: { x: 1.15, y: 1, z: 1.1 },
        rot: { x: 0, y: -1.09, z: 0 }
    }
});

new Menu();

const interval = setInterval(() => {
    loader.checkValues([midi.hdr, midi.model]);
    if (loader.loaded) clearInterval(interval);
})

const setContentHeight = () => {
    const content = document.querySelector("#content")
    const divs = document.querySelectorAll(".content__div")
    const height = content?.clientHeight

    divs.forEach(div => {
        div.setAttribute("style", `min-height:${height}px;max-height:${height}px;`)
    })
}

setContentHeight();
window.addEventListener("resize", setContentHeight)

document.querySelector("#back")?.addEventListener("click", () => {
    document.location.href = "/"
})
