"use strict";

var app = new Vue({
    el: "#app",
    data: {
        game,
        currentTab: "",
        buffModal: false,
        buffReset: true,
        hideWin: false
    },
    watch: {
        win(state) {
            if (state) {
                document.querySelector("body").classList.add("no-scroll")
            } else {
                document.querySelector("body").classList.remove("no-scroll")
            }
        }
    },
    computed: {
        tabs() {
            let tabs = ["Oscillation"]

            if (this.game.unlocks.amplification) tabs.push("Amplification")
            if (this.game.unlocks.prism) tabs.push("Dispersion")
            if (this.game.unlocks.interference) tabs.push("Interference")
            tabs.push("Settings")

            return tabs
        },
        challenges() {
            return DATABASE_CHALLENGE.challenges
        },
        win() {
            return DATABASE_CHALLENGE.isBought(this.game, 10)
        },
        buffDisplay() {
            if (this.game.buffs === 0) return ""
            return `(x${this.format(Math.pow(2, this.game.buffs), 2, 0)} Bonus)`
        }
    },
    methods: {
        showBuffModal(withBuff) {
            this.buffReset = withBuff;
            this.hideWin = true;
            this.buffModal = true;
        },
        hideBuffModal() {
            this.hideWin = false
            this.buffModal = false
        },
        hasCBit(a) {
            return (this.game.interference.current & Math.pow(2, a - 1)) !== 0
        },
        toTabComponent(str = "") {
            return str.toLowerCase() + "-tab"
        },
        format(num, a, b) {
            return toSci(num, a, b);
        },
        loop() {
            return gameLoop(this);
        },
        con() {
            this.game.interference.upgrades ^= Math.pow(2, 9)
        },
        replay() {
            let newSave = JSON.parse(JSON.stringify(game))
            newSave.settings.theme = this.game.settings.theme
            newSave.buffs = this.game.buffs
            newSave.lastTick = Date.now()
            if (this.buffReset) newSave.buffs++;
            localStorage.setItem(SAVE_NAME, JSON.stringify(newSave))
            window.location.reload()
        },
        switchTab(i) {
            this.currentTab = this.tabs[i];
            scroll(0,0); //scroll to top
        },
        setIntevals() {
            setInterval(this.loop, 50);

            setInterval(() => {
                localStorage.setItem(SAVE_NAME, JSON.stringify(this.game))
                console.log("Game saved!");
            }, 10000)
        }
    },
    created() {
        this.switchTab(0);
    },
    mounted() {

        if (localStorage.getItem(SAVE_NAME) !== null) {
            let data = JSON.parse(localStorage.getItem(SAVE_NAME));
            this.game = saveFixer(data, this.game);
        }

        loadTheme();

        setTimeout(() => {
            var body = document.querySelector("body");
            body.classList.add("ready");
            this.setIntevals();
        }, 500) // for the theme to apply propertly, and also to prevent sudden transition
    }
})

function saveFixer(obj, def) {
    let data = {}
    if (obj === null) obj = {}
    if (Array.isArray(def)) {
        if (def.length === 0) {
            return Array.isArray(obj) ? obj : def;
        } else {
            data = []
        }
    }

    for (let key in def) {
        if (obj[key] === undefined || obj[key] === "NaN") {
            data[key] = def[key]
        } else if (typeof obj[key] === "string" && def[key] instanceof Decimal) {
            data[key] = new Decimal(obj[key])
        } else if (typeof obj[key] !== typeof def[key]) {
            data[key] = def[key]
        } else if (typeof obj[key] === "object" && typeof def[key] === "object") {
            data[key] = saveFixer(obj[key], def[key])
        } else {
            data[key] = obj[key]
        }
    }
    return data;
}
