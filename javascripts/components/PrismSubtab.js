"use strict";

Vue.component("prism-subtab", {
    data() {
        return {
            canvas: {
                width: 120,
                height: 120
            }
        }
    },
    props: {
        game: Object
    },
    watch: {
        theme() {
            this.draw()
        }
    },
    computed: {
        theme() {
            return this.game.settings.theme
        },
        getUnlocked() {
            return this.game.unlocks.rainbow
        },
        getGain() {
            return DATABASE_PRISM.gain(this.game);
        },
        canActivate() {
            return DATABASE_PRISM.canReset(this.game)
        },
        getGainInt() {
            return this.format(this.getGain, 2, 0)
        },
        getGainDec() {
            return "." + this.format(this.getGain, 2, 2).split(".")[1]
        },
        getRequirement() {
            return DATABASE_PRISM.requirement(this.game)
        },
        getActivations() {
            return this.game.stats.resets.prism
        },
        isAutoUnlocked() {
            return this.hasUpg(11)
        },
        isAutoActive() {
            return this.game.activate.auto
        },
        getAutoState() {
            return this.isAutoActive ? "on" : "off"
        },
        isValidValue() {
            return isNumberString(this.game.activate.value[this.getAutoMode])
        },
        warning() {
            let str = "Reset all your oscillation upgrades"
            str += this.hasUpg(9) ? " (Except photon deceleration upgrade)" : ""
            str += !this.hasUpg(12) ? ", laser and lenses" : ""
            return str;
        },
        getAutoMode() {
            return this.game.activate.mode;
        },
        getAutoModeText() {
            return DATABASE_PRISM.getAutoModes()[this.getAutoMode];
        },
        getAutoDescription() {
            return DATABASE_PRISM.getAutoDescriptions()[this.getAutoMode];
        },
        getTime() {
            return this.game.stats.currentTime.prism;
        }
    },
    methods: {
        getCssVar(name) {
            return getCssVar(name);
        },
        draw() {
            let w = this.canvas.width , h = this.canvas.height;

            let c = this.$el.querySelector(".prism-display")
            if (c === null) return;
            let ctx = c.getContext("2d");
            ctx.clearRect(0, 0, w, h); // clear the canvas

            ctx.lineWidth = 2;
            ctx.fillStyle = this.getCssVar("--background")
            ctx.strokeStyle = this.getCssVar("--color")

            ctx.beginPath();
            ctx.moveTo(w/2, 0);
            ctx.lineTo(2, h - 2);
            ctx.lineTo(w - 2, h - 2);
            ctx.closePath();
            ctx.stroke();
            ctx.fill();

        },
        format(num, a, b, c) {
            return toSci(num, a, b, c)
        },
        capFirstLetter(str) {
            return str.charAt(0).toUpperCase() + str.substring(1)
        },
        activate() {
            if (this.canActivate) {
                if (!this.game.unlocks.rainbowUpgrades) {
                    document.querySelector(".mask").classList.add("is-active");
                    setTimeout(() => {
                        DATABASE_PRISM.reset(this.game)
                        this.$emit('switch-tab')
                    }, 1500)
                    setTimeout(() => {
                        document.querySelector(".mask").classList.remove("is-active");
                    }, 2000)
                } else {
                    DATABASE_PRISM.reset(this.game)
                }
            }
        },
        toggleAuto() {
            this.game.activate.auto = !this.isAutoActive;
        },
        hasUpg(i) {
            return DATABASE_PRISM.hasUpg(this.game, i)
        },
        toggleAutoMode() {
            DATABASE_PRISM.toggleAutoMode(this.game);
        }
    },
    mounted() {
        this.draw();
    },
    template: `
    <div class="tab prism">
        <div class="prism-stats">
            <div class="prism-input">
                {{format(game.light)}} Light ==>
            </div>
            <canvas class="prism-display" :width="canvas.width" :height="canvas.height"/>
            <div class="prism-output">
                    <span v-if="getGain.lt(10)">==> {{getGainInt}}<span class="disabled">{{getGainDec}}</span> Rainbow</span>
                    <span v-else>==> {{format(getGain, 2, 0)}} Rainbow</span>
            </div>
        </div>

        <div class="prism-energy">
            Activation energy: <span :class="canActivate ? 'green' : 'red'">{{format(getRequirement)}} Light</span>
        </div>

        <div class="prism-activations">
            Number of activations: {{format(getActivations, 2, 0, 100000000)}}
        </div>

        <div class="prism-activations">
            Time spent in current activation (seconds): {{format(getTime, 2, 2, 100000)}}
        </div>

        <div class="prism-warning">
            Activating the prism will:
            <ul>
                <li>Convert all your light into rainbow, rounded down</li>
                <li class="warning">
                    {{warning}}
                </li>
            </ul>
        </div>

        <div>
            <button class="prism-btn"
                    @click="activate"
                    :class="{'disabled': !canActivate}">
                {{game.interference.current === 0 ? "Activate the prism!" : "Complete the interference!"}}
            </button>

            <button v-if="isAutoUnlocked"
                    class="auto-btn"
                    :class="getAutoState"
                    @click="toggleAuto">
                Auto: {{isAutoActive ? "On" : "Off"}}
            </button>

            <button v-if="isAutoUnlocked"
                    class="prism-toggle-mode-btn"
                    @click="toggleAutoMode">
                Mode: {{getAutoModeText}}
            </button>
        </div>

        <span v-if="isAutoUnlocked" class="auto-desc">
            {{getAutoDescription}}&nbsp<input class="auto-field" v-model="game.activate.value[getAutoMode]"
                            :class="{'red': !isValidValue}">
        </span>
    </div>
    `
})
