var game = {
    period: 270,
    light: new Decimal(0),
    decelerate: {
        isActive: false,
        auto: false,
        value: "0"
    },
    upgrades: {
        1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0, 10: 0
    },
    laser: {
        isActive: false,
        time: 0
    },
    lenses: 0, // 4 => lens 3 active, 3 => lens 1 and 2 active... etc
    rainbow: new Decimal(0),
    rainbowUpgrades: 0, // binary
    autobuyUpgrades: false,
    activate: {
        auto: false,
        value: ""
    },
    interference: {
        respec: false,
        current: 0, // binary
        completed: 0, //binary
        upgrades: 0 // binary, 1 => 0001 done, 3 => 0010 + 0001 done etc.
    },
    unlocks: {
        upgrades: false,
        decelerate: false,
        amplification: false,
        laser: false,
        lenses: false,
        prism: false,
        rainbowUpgrades: false,
        interference: false
    },
    achievements: 0, // binary
    achievementConditions: {
        11: false
    },
    buffs: 0,
    stats: {
        currentTime: {
            prism: 0, // the unit is s
            meta: 0
        },
        resets: {
            prism: 0,
            meta: 0
        }
    },
    settings: {
        moveAchievement: false,
        effect: {
            interference: true
        },
        theme: 0
    },
    lastTick: Date.now(),
    saveVersion: 2
}
