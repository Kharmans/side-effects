import {effects} from './macros/effects.mjs';
import {effectHud} from './macros/effectHud.mjs';
import {exportForSharing} from './macros/exportForSharing.mjs';

function init() {
    if (game.settings.get('side-effects', 'exportForSharing')) exportForSharing.toggle(true);
}

async function ready() {
    if (game.settings.get('side-effects', 'replaceStatusEffectIcons')) effects.setStatusEffectIcons();
    if (game.settings.get('side-effects', 'removeStatusEffectsFromHud')) effects.removeStatusEffectsFromHud();
    if (game.settings.get('side-effects', 'disableSpecialEffects')) effects.disableSpecialEffects(true);
    if (game.settings.get('side-effects', 'temporaryEffectHud')) effectHud.toggle(true);
}

export let macros = {
    init,
    ready
};