import {effectInterface} from './applications/effectDirectory.mjs';
Hooks.once('init', () => {
    effectInterface.init();
});