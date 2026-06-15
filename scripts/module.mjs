import {effectInterface} from './applications/effectDirectory.mjs';
import {settings} from './settings.mjs';
Hooks.once('init', () => {
    settings.init();
    effectInterface.init();
});
Hooks.on('setup', () => {
    effectInterface.setup();
});
Hooks.once('ready', () => {
    effectInterface.ready();
});