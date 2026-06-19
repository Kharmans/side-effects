function setStatusEffectIcons() {
    const icons = {
        dead: 'icons/svg/skull.svg',
        bleeding: 'modules/side-effects/images/wounded.svg',
        blinded: 'modules/side-effects/images/blinded.svg',
        burrowing: 'systems/dnd5e/icons/svg/statuses/burrowing.svg',
        charmed: 'modules/side-effects/images/charmed.svg',
        concentrating: 'modules/side-effects/images/concentrating.svg',
        cursed: 'systems/dnd5e/icons/svg/statuses/cursed.svg',
        deafened: 'modules/side-effects/images/deafened.svg',
        diseased: 'systems/dnd5e/icons/svg/statuses/diseased.svg',
        dodging: 'modules/side-effects/images/dodging.svg',
        encumbered: 'systems/dnd5e/icons/svg/statuses/encumbered.svg',
        ethereal: 'systems/dnd5e/icons/svg/statuses/ethereal.svg',
        exceedingCarryingCapacity: 'systems/dnd5e/icons/svg/statuses/exceeding-carrying-capacity.svg',
        exhaustion: 'systems/dnd5e/icons/svg/statuses/exhaustion.svg',
        flying: 'systems/dnd5e/icons/svg/statuses/flying.svg',
        frightened: 'modules/side-effects/images/frightened.svg',
        grappled: 'modules/side-effects/images/grappled.svg',
        heavilyEncumbered: 'systems/dnd5e/icons/svg/statuses/heavily-encumbered.svg',
        hiding: 'systems/dnd5e/icons/svg/statuses/hiding.svg',
        hovering: 'systems/dnd5e/icons/svg/statuses/hovering.svg',
        incapacitated: 'modules/side-effects/images/incapacitated.svg',
        invisible: 'modules/side-effects/images/invisible.svg',
        marked: 'systems/dnd5e/icons/svg/statuses/marked.svg',
        paralyzed: 'modules/side-effects/images/paralyzed.svg',
        petrified: 'modules/side-effects/images/petrified.svg',
        poisoned: 'modules/side-effects/images/poisoned.svg',
        prone: 'modules/side-effects/images/prone.svg',
        restrained: 'modules/side-effects/images/restrained.svg',
        silenced: 'systems/dnd5e/icons/svg/statuses/silenced.svg',
        sleeping: 'systems/dnd5e/icons/svg/statuses/sleeping.svg',
        stable: 'systems/dnd5e/icons/svg/statuses/stable.svg',
        stunned: 'modules/side-effects/images/stunned.svg',
        surprised: 'systems/dnd5e/icons/svg/statuses/surprised.svg',
        transformed: 'systems/dnd5e/icons/svg/statuses/transformed.svg',
        unconscious: 'icons/svg/unconscious.svg'
    };
    let iconKeys = Object.keys(icons).filter(i => !CONFIG.statusEffects[i]?.name?.startsWith('MonksLittleDetails'));
    iconKeys.forEach(i => CONFIG.statusEffects[i].img = icons[i]);
}
function removeStatusEffectsFromHud() {
    let effectsToRemove = game.settings.get('side-effects', 'removedStatusEffects');
    effectsToRemove.forEach(i => CONFIG.statusEffects[i].hud = false);
}
function disableSpecialEffects(enabled) {
    CONFIG.specialStatusEffects.BLIND = enabled ? null : 'blinded';
    CONFIG.specialStatusEffects.INVISIBLE = enabled ? null : 'invisible';
}
export let effects = {
    setStatusEffectIcons,
    removeStatusEffectsFromHud,
    disableSpecialEffects
};