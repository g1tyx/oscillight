"use strict";

Vue.component("settings-tab", {
    data() {
        return {
            SAVE_NAME,
            themes,
            showWipeDataModal: false,
            showImportModal: false
        }
    },
    props: {
        game: Object
    },
    methods: {
        importSave(save) {
            this.showImportModal = false;

            if (save === null || save === "") return
            if (isValidSave(save)) {
                localStorage.setItem(SAVE_NAME, window.atob(save))
                window.location.reload()
            }
        },
        exportSave() {
            copyText(btoa(JSON.stringify(this.game)));
        },
        switchTheme() {
            this.game.settings.theme ++;
            if (this.game.settings.theme >= themes.length) {
                this.game.settings.theme = 0;
            }
            setTheme(this.game.settings.theme);
        },
        reset() {
            localStorage.removeItem(SAVE_NAME);
            location.reload();
        }
    },
    template: `
    <div class="tab settings-tab">
        <div class="settings-btn-con">
            <button @click="switchTheme">
                Theme: {{themes[game.settings.theme]}}
            </button>

            <button @click="showImportModal = true">
                Import
            </button>

            <tooltip-button @click="exportSave" tooltip="Copied!">
                Export
            </tooltip-button>

            <button class="warning" @click="showWipeDataModal = true">
                Wipe all data
            </button>
        </div>

        <div class="extra">
            Created by Buck | Made for IGJ 2021 | <a target="_blank" href="https://discord.com/invite/N8MuKMz">Discord</a>
        </div>

        <confirmation-modal v-if="showWipeDataModal" @yes="reset" @no="showWipeDataModal = false">
            <template #header>
                <span class="warning">Wipe all data</span>
            </template>

            Are you sure you want to wipe all user data? <span class="warning">This cannot be undone!</span>
        </confirmation-modal>

        <prompt-modal v-if="showImportModal" @submit="importSave" @close="showImportModal = false">
            <template #header>
                Import
            </template>

            Please paste your save file here: <span class="warning">(Your current save will be overwritten!)</span>
        </prompt-modal>
    </div>
    `
})
