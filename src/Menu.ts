import translations from "./translations";

export default class Menu {
    navButtons: NodeListOf<Element>;
    settingsButton: HTMLButtonElement | null;
    languageButton: HTMLButtonElement | null;
    settingsModal: HTMLElement | null;
    langModal: HTMLElement | null;
    snapSwitch: HTMLInputElement | null;
    themeSwitch: HTMLInputElement | null;
    lang: string | null;

    constructor() {
        this.navButtons = document.querySelectorAll("nav > ul button:not(.settings)");
        this.settingsButton = document.querySelector(".settings");
        this.languageButton = document.querySelector(".lang");
        this.settingsModal = document.querySelector(".settings__modal")
        this.langModal = document.querySelector(".lang__modal");
        this.lang = "en";

        // Switches
        this.snapSwitch = document.querySelector("input[data-function='snap']")
        this.themeSwitch = document.querySelector("input[data-function='theme']")

        this.init();
    }


    // Event Listeners & Setup
    init() {
        this.__registerSettingSwitches();
        this.__registerLangButtons();
        this.__registerNavButtons();

        this.loadSettings();
    }

    __registerNavButtons() {
        const buttonArr = [this.settingsButton, this.languageButton];

        this.settingsButton?.addEventListener("click", () => {
            this.settingsModal?.classList.toggle("active")
        })

        this.languageButton?.addEventListener("click", () => {
            this.langModal?.classList.toggle("active")
        })

        // Close settingsModal when clicking outside
        buttonArr.forEach(button => {
            if (!button) return;
            document.addEventListener('click', (e) => {
                const outsideClick = !button.parentElement?.contains(<HTMLElement>e.target);

                if (!outsideClick) return;

                const modal = button.nextElementSibling;

                if (modal?.classList.contains("active")) modal.classList.remove("active")
            });
        })
    }

    __registerLangButtons() {
        const buttons = document.querySelectorAll(".lang__modal > button");

        buttons.forEach(button => {
            button.addEventListener("click", (e) => {
                const target = <HTMLInputElement>e.target;

                this.lang = target.dataset.lang!
                this.changeLang(this.lang);

                setTimeout(() => { this.storeSettings(); this.langModal?.classList.toggle('active') }, 10)
            })
        })
    }

    __registerSettingSwitches() {
        const switches = document.querySelectorAll("input[data-function]")

        this.snapSwitch?.addEventListener("click", (e) => this.toggleSnap((<HTMLInputElement>e.target).checked));
        this.themeSwitch?.addEventListener("click", (e) => this.toggleTheme((<HTMLInputElement>e.target).checked ? "dark" : "light"));

        switches.forEach(sw => {
            sw.addEventListener("click", () => {
                setTimeout(() => this.storeSettings(), 10)
            })
        })
    }


    // Functions
    storeSettings() {
        const settings = {
            snap: this.snapSwitch?.checked,
            theme: this.themeSwitch?.checked,
            lang: this.lang,
        }

        localStorage.setItem("settings", JSON.stringify(settings))
    }

    loadSettings() {
        let settings;

        if (localStorage.getItem("settings")) settings = JSON.parse(localStorage.getItem("settings")!);
        else settings = {
            snap: false,
            theme: false,
            lang: "en"
        }

        if (settings.lang) {
            this.lang = settings.lang;
            this.changeLang(settings.lang);
        }
        if (this.snapSwitch) {
            this.snapSwitch.checked = settings.snap;
            this.toggleSnap(settings.snap);
        }
        if (this.themeSwitch) {
            this.themeSwitch.checked = settings.theme;
            this.toggleTheme(settings.theme ? "dark" : "light")
        }
    }


    // Callbacks
    changeLang(langCode: string) {
        const translation = translations[langCode];
        this.languageButton!.innerHTML = `${langCode.toUpperCase()} <ion-icon name="globe-outline"></ion-icon>`
        document.documentElement.setAttribute("lang", langCode)

        for (const [key, value] of Object.entries(translation)) {
            const element = translations["elements"][key];

            if(!element) {
                console.warn(`element with key: ${key} not found`);
                continue;
            }

            element.innerHTML = value;
        }
    }

    toggleSnap(checked: boolean) {
        const divs = document.querySelectorAll("#content > div");

        if (checked) {
            document.documentElement.style.scrollSnapType = "y mandatory"
            divs.forEach((div: any) => div.style.scrollSnapAlign = "center")
        } else {
            document.documentElement.style.scrollSnapType = ""
            divs.forEach((div: any) => div.style.scrollSnapAlign = "center")
        }
    }

    toggleTheme(theme: string) {
        const themeLight: themeProperty[] = [
            ["--background", "hsl(212, 60%, 96%)"],
            ["--content-background", "hsl(212, 52.5%, 93%)"],
            ["--text", "hsl(210, 24%, 16%)"],
            ["--accent", "hsl(212, 30%, 85%)"],
            ["--accent-secondary", "hsl(212, 21.5%, 75%)"],
            ["--accent-secondary-darkend", "hsl(213, 22%, 70%)"],
            ["--accent-secondary-darkend-extra", "hsl(213, 22%, 65%)"],
        ]

        const themeDark: themeProperty[] = [
            ["--background", "hsl(0, 0%, 13%)"],
            ["--content-background", "hsl(0, 0%, 12.2%)"],
            ["--text", "hsl(0, 0%, 93%)"],
            ["--accent", "hsl(0, 0%, 11%)"],
            ["--accent-secondary", "hsl(0, 0%, 9.5%)"],
            ["--accent-secondary-darkend", "hsl(0, 0%, 8.5%)"],
            ["--accent-secondary-darkend-extra", "hsl(0, 0%, 7%)"],
        ]

        if (theme === "light") {
            themeLight.forEach(property => document.documentElement.style.setProperty(property[0], property[1]))
        } else {
            themeDark.forEach(property => document.documentElement.style.setProperty(property[0], property[1]))
        }
    }
}