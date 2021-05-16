const DATABASE_CHALLENGE = {
    challenges: [
        {
            id: 1,
            acronym: "R",
            color: "red",
            name: "Red Interference",
            desc: "Lenses are 75% weaker"
        },
        {
            id: 2,
            acronym: "B",
            color: "blue",
            name: "Blue Interference",
            desc: "Laser is 50% weaker"
        },
        {
            id: 3,
            acronym: "G",
            color: "green",
            name: "Green Interference",
            desc: "Raise total light gain to the power of 0.75"
        },
        {
            id: 4,
            acronym: "Y",
            color: "gold", //yellow is too bright
            name: "Yellow Interference",
            desc: "All base light gain multipliers from oscillation upgrades are disabled"
        }
    ],
    enterChallenge(g, id = 0) {
        DATABASE_PRISM.reset(g, true)
        g.interference.current = id
    },
    exitChallenge(g) {
        this.enterChallenge(g)
    },
    requirements: [
        {
            id: 1,
            requirement: new Decimal("1e120")
        },
        {
            id: 2,
            requirement: new Decimal("1e55")
        },
        {
            id: 3,
            requirement: new Decimal("1e100")
        },
        {
            id: 4,
            requirement: new Decimal("1e125")
        },
        {
            id: 5,
            requirement: new Decimal("1e125")
        },
        {
            id: 6,
            requirement: new Decimal("1e85")
        },
        {
            id: 7,
            requirement: new Decimal("1e100")
        },
        {
            id: 8,
            requirement: new Decimal("1e85")
        },
        {
            id: 9,
            requirement: new Decimal("1e100")
        },
        {
            id: 10,
            requirement: new Decimal("1e105")
        },
        {
            id: 11,
            requirement: new Decimal("1e110")
        },
        {
            id: 12,
            requirement: new Decimal("1e145")
        },
        {
            id: 13,
            requirement: new Decimal("1e130")
        },
        {
            id: 14,
            requirement: new Decimal("1e130")
        },
        {
            id: 15,
            requirement: new Decimal("1e120")
        }
    ],
    getRequirement(id) {
        for (let r of this.requirements) {
            if (id === r.id) return r.requirement
        }
        return new Decimal("1e9999")
    },
    isInChallenge(g, id) {
        return (g.interference.current & Math.pow(2, id - 1)) !== 0
    },
    totalNodes(g) {
        let count = 0
        for (let i = 1; i <= 15; i++) {
            if ((g.interference.completed & Math.pow(2, i - 1)) !== 0) {
                count++;
            }
        }
        return count;
    },
    nodes(g) {
        let spent = this.upgrades.filter(u => this.hasUpg(g, u.id))
                                 .reduce((a, g) => a += g.cost, 0)
        return this.totalNodes(g) - spent;
    },
    hasUpg(g, id) {
        return (g.interference.upgrades & Math.pow(2, id - 1)) !== 0
    },
    applyUpg(g, id, def = 1) {
        return this.hasUpg(g, id) ? this.upgrades.filter(u => id === u.id)[0].current(g) : def
    },
    /*
    Upgrade format:
    REQUIRED
    id: number, must be unique
    tier: n-th row the upgrade will be on
    name: string, self explainatory
    desc: string, self explainatory
    cost: number, self explainatory

    OPTIONAL
    current: function that accepts g as input,
             should output a number / decimal
    prefix: the prefix used when displaying "current"
            the default is "x"
    parent: the upgrades needed to purchase before unlocking this one,
            should be a number (because yes)
    */
    upgrades: [
        {
            id: 1,
            tier: 1,
            name: "Fusion",
            desc: "Multiplier to light, increases based on light",
            current: (g) => Decimal.pow(1.25, Decimal.log10(g.light.add(1))),
            cost: 2
        },
        {
            id: 2,
            tier: 1,
            name: "Overclock",
            desc: "Red lens is 50% stronger",
            cost: 1
        },
        {
            id: 3,
            tier: 1,
            name: "Darkness",
            desc: "Multiplier to light based on total number of nodes",
            current: (g) => Math.pow(10, DATABASE_CHALLENGE.totalNodes(g)),
            cost: 1
        },
        {
            id: 4,
            tier: 1,
            name: "Infinity",
            desc: "The stablization energy level is softcapped instead of hardcapped",
            cost: 1
        },
        {
            id: 5,
            tier: 1,
            name: "Supernova",
            desc: "Static multiplier to light",
            current: () => 1e15,
            cost: 2
        },
        {
            id: 6,
            tier: 2,
            parent: 1,
            name: "Recursion",
            desc: "Gain more rainbow based on unspent rainbow",
            current: (g) => Decimal.pow(3, Decimal.log10(g.rainbow.add(1))),
            cost: 2
        },
        {
            id: 7,
            tier: 2,
            parent: 2,
            name: "htootwaS",
            desc: "Multiplier to light, decreases based on time in current activation",
            current: (g) => Math.max(1, Math.pow(10, 10 - g.stats.currentTime.prism / 120)),
            cost: 1
        },
        {
            id: 8,
            tier: 2,
            parent: 3,
            name: "Divergence",
            desc: "All lenses are 25% stronger",
            cost: 1
        },
        {
            id: 9,
            tier: 2,
            parent: 4,
            name: "Sawtooth",
            desc: "Multiplier to light, increases based on time in current activation",
            current: (g) => Math.pow(g.stats.currentTime.prism + 1, 2.5),
            cost: 1
        },
        {
            id: 10,
            tier: 2,
            parent: 5,
            name: "Absolute",
            desc: "Multiplier to light, based on number of interference you are in",
            current: (g) => {
                let count = 0;
                for (let c of DATABASE_CHALLENGE.challenges) {
                    if (DATABASE_CHALLENGE.isInChallenge(g, c.id)) count++;
                }
                return Math.pow(1e5, count)
            },
            cost: 2
        },
        {
            id: 11,
            tier: 3,
            parent: 6,
            name: "Mitosis",
            desc: "10th oscillation upgrade boost x2 -> x2.75",
            cost: 4
        },
        {
            id: 12,
            tier: 3,
            parent: 7,
            name: "Tachyon",
            desc: "Laser runs x3 faster, but red lens is 25% stronger",
            cost: 1
        },
        {
            id: 13,
            tier: 3,
            parent: 8,
            name: "Convergence",
            desc: "Increase base light gain based on your rainbow",
            current: (g) => Math.pow(g.rainbow, 0.3),
            prefix: "+",
            cost: 1
        },
        {
            id: 14,
            tier: 3,
            parent: 9,
            name: "Dilation",
            desc: "Laser runs x3 slower, but blue lens is 25% stronger",
            cost: 1
        },
        {
            id: 15,
            tier: 3,
            parent: 10,
            name: "Stability",
            desc: "Set the base light gain multi to x1e10",
            cost: 4
        },
        {
            id: 16,
            tier: 4,
            parent: 13,
            name: "Conclusion",
            desc: "Complete the game",
            cost: 12
        }
    ]
}
