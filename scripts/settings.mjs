const settingsData = {
    effectCompendiumCreated: {
        config: false,
        type: Boolean,
        default: false
    },
    effectInterfaceEnabled: {
        config: true,
        type: Boolean,
        default: true,
        requiresReload: true
    },
    effectCompendium: {
        config: true,
        type: String,
        default: 'world.effects',
        requiresReload: true
    },
    effectInterfacePlacement: {
        config: true,
        type: String,
        default: 'macros',
        requiresReload: true,
        choices: Object.keys(CONFIG.ui.sidebar.TABS).reduce((obj, key) => {
            obj[key] = key.capitalize();
            return obj;
        }, {})
    }
};
function addSetting(key, options) {
    const defaultOptions = {
        scope: 'world',
        config: false,
        name: 'SIDEEFFECTS.Settings.' + key.capitalize() + '.Name',
        hint: 'SIDEEFFECTS.Settings.' + key.capitalize() + '.Hint'
    };
    game.settings.register('side-effects', key, foundry.utils.mergeObject(defaultOptions, options));
}
function init() {
    Object.entries(settingsData).sort().forEach(([key, options]) => {
        addSetting(key, options);
    });
}
export let settings = {
    init
};