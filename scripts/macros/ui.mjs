function _setBodyProperty(key, value) {
    document.body.style.setProperty(key, String(value));
}
function _removeBodyProperty(key) {
    document.body.style.removeProperty(key);
}
function buttonScale(value) {
    if (value != 1) {
        _setBodyProperty('--sideeffects-ui-button-scale', value);
        let el = document.createElement('style');
        el.id = 'sideeffects-ui-button-scale';
        el.innerHTML = `
            body #interface #ui-left #ui-left-column-1 #scene-controls {
                transform: scale(var(--sideeffects-ui-button-scale));
                transform-origin: top left;
            }
            body #interface #ui-left #ui-left-column-1 {
                --control-size: calc(var(--sideeffects-ui-button-scale) * 32px);
            }
            body #interface #ui-right #sidebar #sidebar-tabs {
                transform: scale(var(--sideeffects-ui-button-scale));
                transform-origin: top right;
            }
        `;
        document.querySelector('head').appendChild(el);
    } else {
        _removeBodyProperty('--sideeffects-ui-button-scale');
        document.querySelector('#sideeffects-ui-button-scale')?.remove();
    }
}
function navigationScale(value) {
    if (value != 1) {
        _setBodyProperty('--sideeffects-ui-navigation-scale', value);
        let el = document.createElement('style');
        el.id = 'sideeffects-ui-navigation-scale';
        el.innerHTML = `
            body #interface #ui-left #ui-left-column-2 {
                transform: scale(var(--sideeffects-ui-navigation-scale));
                transform-origin: top left;
            }
        `;
        document.querySelector('head').appendChild(el);
    } else {
        _removeBodyProperty('--sideeffects-ui-navigation-scale');
        document.querySelector('#sideeffects-ui-navigation-scale')?.remove();
    }
}
function customSidebar(value) {
    if (value) {
        let el = document.createElement('style');
        el.id = 'sideeffects-custom-sidebar';
        el.innerHTML = `
            body #interface #ui-right #sidebar #sidebar-content {
                #chat {
                    width: auto;
                    background: var(--sidebar-background, var(--color-cool-5-90));
                    .chat-scroll {
                        direction: ltr;
                    }
                    .chat-form .jump-to-bottom {
                        right: 4px;
                    }
                }
                .sidebar-tab {
                    box-shadow: 0 0 10px #000;
                }
            }
        `;
        document.querySelector('head').appendChild(el);
    } else {
        document.querySelector('#sideeffects-custom-sidebar')?.remove();
    }
}
function customChatMessage(value, pass) {
    if (value) {
        let el = document.createElement('style');
        el.id = 'sideeffects-custom-chat-message';
        el.innerHTML = `
            :is(.chat-popout, #chat-log, .chat-log) {
                .message::before {
                    background: var(--dnd5e-color-dark-gray) url(../../../ui/denim075.png);
                }
                .message {
                    .flavor-text {
                        color: var(--color-text-secondary)
                    }
                    .message-content {
                        color: var(--color-text-primary);
                        .chat-card .description {
                            background: var(--dnd5e-background-card);
                            border-color: transparent;
                        }
                        .dice-result .dice-total.success:not(.fumble),
                        .dice-result .dice-total.critical {
                            background: color-mix(in oklab, var(--dnd5e-color-success-critical) 35%, transparent);
                            color: var(--dnd5e-color-success-background);
                            box-shadow: none;
                        }
                        .dice-result .dice-total.failure:not(.critical),
                        .dice-result .dice-total.fumble {
                            background: color-mix(in oklab, var(--dnd5e-color-failure-critical) 20%, transparent);
                            color: var(--dnd5e-color-failure-background);
                            box-shadow: none;
                        }
                        .dice-tooltip .dice-rolls .roll.discarded, .dice-tooltip .dice-rolls .roll.rerolled {
                            color: #000;
                            filter: opacity(0.7);
                        }
                        .midi-qol-tooltiptext {
                            background: var(--dnd5e-color-dark-gray) url(../../../ui/denim075.png);
                        }
                    }
                }
            }
            :is(.chat-popout, #chat-log, .chat-log) .midi-results .target.failure,
            .midi-results .target.failure  {
                border: var(--dnd5e-color-failure) 1px solid;
                background-color: color-mix(in oklab, var(--dnd5e-color-failure-critical) 20%, transparent);
                border-radius: 3px;
            }
            :is(.chat-popout, #chat-log, .chat-log) .midi-results .target.success,
            .midi-results .target.success  {
                border: var(--dnd5e-color-success) 1px solid;
                background-color: color-mix(in oklab, var(--dnd5e-color-success-critical) 35%, transparent);
                border-radius: 3px;
            }
        `;
        document.querySelector('head').appendChild(el);
        Hooks.on('renderApplicationV2', _chatMessageThemeHook);
        if (pass === 'init') {
            Hooks.once('ready', _chatMessageThemeApply);
        } else {
            ui.chat.render(true);
        }
    } else {
        document.querySelector('#sideeffects-custom-chat-message')?.remove();
        Hooks.off('renderApplicationV2', _chatMessageThemeHook);
        _chatMessageThemeRemove();
    }
}
function _chatMessageThemeHook(application, element, context, options) {
    let themedElement = element.matches('.chat-popout.theme-light,.chat-log.theme-light') ? element : element.querySelector('.chat-popout.theme-light,.chat-log.theme-light');
    if (themedElement) {
        themedElement.classList.remove('theme-light');
        themedElement.classList.add('theme-dark');
    }
}
function _chatMessageThemeApply() {
    let themedElements = document.querySelectorAll('.chat-popout.theme-light,.chat-log.theme-light');
    themedElements.forEach(el => {
        el.classList.remove('theme-light');
        el.classList.add('theme-dark');
    });
}
function _chatMessageThemeRemove() {
    let themedElements = document.querySelectorAll('.chat-popout.theme-dark,.chat-log.theme-dark');
    themedElements.forEach(el => {
        el.classList.remove('theme-dark');
        el.classList.add('theme-light');
    });
}
export let customUi = {
    buttonScale,
    navigationScale,
    customSidebar,
    customChatMessage
};