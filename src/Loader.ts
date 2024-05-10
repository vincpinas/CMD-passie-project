export default class Loader {
    loadedFiles: any[];
    loaded: boolean;
    progress: HTMLSpanElement | null;
    blocked: boolean;
    removeDelay: number;

    constructor() {
        this.loadedFiles = [];
        this.progress = document.querySelector(".loading__progress");
        this.loaded = false;
        this.blocked = false;
        this.removeDelay = 550;
    }

    checkValues(values: any[]) {
        if (!this.progress) return;

        for (let i = 0; i < values.length; i++) {
            if (typeof values[i] == "undefined") return;
            else if (this.loadedFiles.indexOf(values[i]) < 0 && !this.blocked) {
                this.blocked = true;
                this.loadedFiles.push(values[i]);
                
                const min = Math.ceil(230)
                const max = Math.floor(590)
                const visual_delay = Math.floor(Math.random() * (max - min + 1)) + min;
                
                setTimeout(() => {
                    this.blocked = false;
                }, visual_delay)
            }
        }

        this.progress.style.width = `${(100 / values.length) * this.loadedFiles.length}%`
        
        if (this.loadedFiles.length >= values.length) {
            setTimeout(() => {
                this.removeScreen();
                this.loaded = true;
            }, this.removeDelay)
        }
    }

    removeScreen() {
        const screen = document.querySelector(".loading");

        if (!screen) return;

        screen.setAttribute("style", "opacity:0;")

        setTimeout(() => {
            screen.remove();
        }, this.removeDelay)
    }
}