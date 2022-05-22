const DATABASE_PRISM = {
    baseRequirement: new Decimal(1e60),
    requirement(g) {
        if (g.interference.current !== 0) {
            return DATABASE_CHALLENGE.getRequirement(g.interference.current)
        } else {
            return this.baseRequirement
        }
    },
    canReset(g) {
        let requirement = this.requirement(g)
        return g.light.gte(requirement)
    },
    gain(g) {
        if (!this.canReset(g)) return new Decimal(0);

        let base = Decimal.max(1, Decimal.pow(10, Decimal.log(g.light.add(1), 1e60) - 1));

        return base.times(DATABASE_CHALLENGE.applyUpg(g, 6))
    },
    toggleAutoMode(g) {
        g.activate.mode = (g.activate.mode + 1) % this.getAutoModes().length;
    },
    getAutoModes() {
        return ["Rainbow", "Light", "Time"];
    },
    getAutoDescriptions() {
        return [
            "Activate the prism at X Rainbow:",
            "Activate the prism at X Light:",
            "Activate the prism after X seconds:"
        ]
    },
    hasMetAutoRequirement(g) {
        let mode = g.activate.mode;
        if (!g.activate.auto || !isNumberString(g.activate.value[mode])) return false;
        let val = new Decimal(g.activate.value[mode]);
        switch (mode) {
            case 0: return DATABASE_PRISM.gain(g).gte(val);
            case 1: return g.light.gte(val);
            case 2: return val.lt(g.stats.currentTime.prism); // Time >= val
            default: return false;
        }
    },
    reset(g, forced = false) {

        // normally, resetting is not allowed when the player cannot gain anything,
        // however, when entering / exiting a challenge, the forced mode is used

        // force mode bypasses the check for "has gain"

        if (!this.canReset(g) && !forced) return false

        DATABASE_WAVE.upgrades.filter(upg => (this.hasUpg(g, 9)) ? upg.id !== 6 : true)
                              .forEach(upg => g.upgrades[upg.id] = 0);

        if (!this.hasUpg(g, 9)) {
            g.decelerate.auto = false
            g.decelerate.isActive = false
        }

        if (!this.hasUpg(g, 12)) {
            g.unlocks.laser = false
            g.lenses = 0
            g.unlocks.lenses = false
        }

        if (!this.hasUpg(g, 12) || forced) {
            g.laser.time = 0
            g.laser.isActive = false
        }

        //When entering / exiting a challenge, the player does not gain activations

        if (!forced) g.stats.resets.prism ++

        g.rainbow = g.rainbow.add(Decimal.floor(this.gain(g)))
        g.light = new Decimal(0)
        g.unlocks.rainbowUpgrades = true
        g.stats.currentTime.prism = 0

        // Not entering / exiting a challenge, and is inside a challenge

        if (!forced && g.interference.current !== 0) {
            g.laser.time = 0
            g.laser.isActive = false

            g.interference.completed |= Math.pow(2, g.interference.current - 1)
            g.interference.current = 0
        }

        if (g.interference.respec) {
            g.interference.respec = false
            g.interference.upgrades = 0
        }

        if (g.laser.time === 0) { // The laser is deactivated
            g.achievementConditions["11"] = true
        }
    },
    hasUpg(g, i) {
        return (g.rainbowUpgrades & Math.pow(2, i - 1)) !== 0
    },
    applyUpg(g, i) {
        return this.hasUpg(g, i) ? this.upgrades[i - 1].current(g) : 1
    },
    upgrades: [
        {
            id: 1,
            name: "Decay",
            desc: "Multiplier to light, decays based on your light",
            current: (g) => Decimal.max(1, 20 - Decimal.log10(g.light.add(1)) / 3),
            cost: new Decimal(1)
        },
        {
            id: 2,
            name: "Static",
            desc: "Static multiplier to light",
            current: () => new Decimal(10),
            cost: new Decimal(1)
        },
        {
            id: 3,
            name: "Growth",
            desc: "Multiplier to light, grows based on your light",
            current: (g) => Decimal.min(20, Decimal.log10(g.light.add(1)) / 3 + 1),
            cost: new Decimal(1)
        },
        {
            id: 4,
            name: "Shallow amplification",
            desc: "Multiplier to light gain based on number of prism activations",
            current: (g) => Math.pow(g.stats.resets.prism > 10000 ? 10000 + (g.stats.resets.prism - 10000) / 5 : g.stats.resets.prism, 1.5) + 1,
            cost: new Decimal(2)
        },
        {
            id: 5,
            name: "Deep amplification",
            desc: "Multiplier to base light based on number of prism activations",
            current: (g) => Math.pow(g.stats.resets.prism, 0.3) + 1,
            cost: new Decimal(2)
        },
        {
            id: 6,
            name: "Quick charge",
            desc: "Laser charges and stabilizes 80% faster",
            cost: new Decimal(3)
        },
        {
            id: 7,
            name: "Anti-prism",
            desc: "Your unspent rainbow boost light gain",
            current: (g) => Decimal.pow(Decimal.log10(g.rainbow.times(5).plus(1)) + 1, 4),
            cost: new Decimal(35)
        },
        {
            id: 8,
            name: "Resonance",
            desc: "Unlock oscillation upgrades autobuyer",
            cost: new Decimal(25)
        },
        {
            id: 9,
            name: "Backup decelerator",
            desc: "Keep auto photon decelerate when activating prism",
            cost: new Decimal(15)
        },
        {
            id: 10,
            name: "Colored lens",
            desc: "Your unspent rainbow boost laser",
            current: (g) => Decimal.log10(g.rainbow.plus(1)) / 30 + 1,
            cost: new Decimal(200)
        },
        {
            id: 11,
            name: "Enlightened",
            desc: "You can activate prism automatically",
            cost: new Decimal(2000)
        },
        {
            id: 12,
            name: "Backup laser",
            desc: "Keep laser after activating prism",
            cost: new Decimal(300)
        }
    ]
}
