const DocumentDirectory = foundry.applications.sidebar.DocumentDirectory;

let effectCollection = null;

class EffectDirectory extends DocumentDirectory {
    static DEFAULT_OPTIONS = {
        collection: 'ActiveEffect'
    };
    static tabName = 'effects';
    get collection() {
        if (!effectCollection) effectCollection = game.packs.get('world.effects');
        return effectCollection;
    }
    _getEntryContextOptions() {
        const getDocument = li => this.collection.get(li.closest('[data-entry-id]').dataset.entryId);
        let options = super._getEntryContextOptions();
        options = options.filter(e => !['OWNERSHIP.Configure'].includes(e.label));
        let exportOption = options.find(e => e.label === 'SIDEBAR.Export');
        exportOption.onClick = (event, li) => {
            let document = getDocument(li);
            if (!document) return;
            let effectData = document.toObject();
            delete effectData._id;
            delete effectData.origin;
            let tempEffect = new CONFIG.ActiveEffect.documentClass(effectData);
            if (tempEffect) {
                let data = tempEffect.toCompendium(null, options);
                data.flags.exportSource = {
                    world: game.world.id,
                    system: game.system.id,
                    coreVersion: game.version,
                    systemVersion: game.system.version
                };
                let filename = ['fvtt', tempEffect.documentName, tempEffect.name?.slugify(), tempEffect.id].filterJoin('-');
                foundry.utils.saveDataToFile(JSON.stringify(data, null, 2), 'text/json', filename + '.json');
            }
        };
        let importOption = options.find(e => e.label === 'SIDEBAR.Import');
        importOption.onClick = async (event, li) => {
            let document = getDocument(li);
            if (!document) return;
            await foundry.applications.api.DialogV2.wait({
                window: {title: `${_loc('DOCUMENT.ImportData')}: ${this.name}`},
                position: {width: 400},
                content: await foundry.applications.handlebars.renderTemplate('templates/apps/import-data.hbs', {
                    hint1: _loc('DOCUMENT.ImportDataHint1', {document: this.documentName}),
                    hint2: _loc('DOCUMENT.ImportDataHint2', {name: this.name})
                }),
                buttons: [{
                    action: 'import',
                    label: 'Import',
                    icon: 'fa-solid fa-file-import',
                    callback: (event, button) => {
                        const form = button.form;
                        if ( !form.data.files.length ) {
                            return ui.notifications.error('DOCUMENT.ImportDataError', {localize: true});
                        }
                        foundry.utils.readTextFromFile(form.data.files[0]).then(json => importFromJSON(json));
                    },
                    default: true
                }, {
                    action: 'no',
                    label: 'COMMON.Cancel',
                    icon: 'fa-solid fa-xmark'
                }]
            });
            async function importFromJSON(json) {
                const parsedJSON = JSON.parse(json);
                const doc = await document.constructor.fromImport(parsedJSON);
                let data = doc;
                if (doc instanceof foundry.abstract.Document) {
                    data = doc.toObject();
                    if ( doc.pack ) foundry.utils.setProperty(data, '_stats.compendiumSource', doc.uuid);
                }
                data.ownership &&= Object.entries(data.ownership).reduce((ownership, [key, level]) => {
                    if ( (key === 'default') || game.users.has(key) ) ownership[key] = level;
                    return ownership;
                }, {});
                data.ownership ??= {};
                data.ownership[game.user.id] = CONST.DOCUMENT_OWNERSHIP_LEVELS.OWNER;
                for ( const k of document.constructor.metadata.preserveOnImport ) delete data[k];
                await document.update(data, {diff: false, recursive: false, noHook: true});
                ui.notifications.info('DOCUMENT.Imported', {format: {document: document.documentName, name: document.name}});
                return document;
            }
        };
        return options;
    }
    _getFolderContextOptions() {
        let options = super._getFolderContextOptions(); 
        options = options.filter(e => !['OWNERSHIP.Configure', 'FOLDER.Export'].includes(e.label));
        return options;
    }
    _hydrateTree(node, pack) {
        if (!node) return null;
        return {
            ...node,
            entries: (node.entries || []).map(indexData => {
                const liveDoc = pack.get(indexData._id);
                if (liveDoc) {
                    if (!Object.hasOwn(liveDoc, 'visible')) {
                        Object.defineProperty(liveDoc, 'visible', {value: true, configurable: true});
                    }
                    return liveDoc; 
                }
                return indexData;
            }),
            children: (node.children || []).map(child => this._hydrateTree(child, pack)).filter(Boolean)
        };
    }
    async _prepareContext(options) {
        const context = await super._prepareContext(options);
        const pack = this.collection;
        await pack.getDocuments();
        const sourceTree = context.tree || pack.tree || {root: true, entries: [], children: [], depth: 0};
        context.tree = this._hydrateTree(sourceTree, pack);
        
        return context;
    }
    async _preparePartContext(partId, context, options) {
        const partContext = await super._preparePartContext(partId, context, options);
        if (partContext.tree) {
            partContext.tree = this._hydrateTree(partContext.tree, this.collection);
        }
        return partContext;
    }
}
function effectHotbarDrop(hotbar, data, slot) {
    if (!data.cprEffect) return;
    let doc = fromUuidSync(data.uuid);// get the active effect
    // eslint-disable-next-line no-undef
    Macro.implementation.create({
        name: doc.name,
        type: CONST.MACRO_TYPES.SCRIPT,
        img: doc.img,
        command: `await token.actor.createEmbeddedDocuments('ActiveEffect', [{...doc.toObject(), _id: randomID()}]);` // get effect from uuid in there .toObject
    }).then((macro) => {
        game.user.assignHotbarMacro(macro, slot, {fromSlot: data.slot});
    });
    return false;
}
async function fromStatusEffect(wrapped, statusId, options = {}) { // on precreate check if the uh effect has the status id um of a you know so called registered uh effect status
    //but need compendium to already be loaded
}
function patch(enabled) {
    //call from status effect
}
function init() {
    CONFIG.ui.effects = EffectDirectory;
    let tabs = Object.entries(CONFIG.ui.sidebar.TABS);
    let macroIdx = tabs.findIndex(i => i[0] === 'macros');
    if (macroIdx === -1) macroIdx = tabs.length - 1;
    tabs.splice(macroIdx + 1, 0, ['effects', {
        tooltip: 'Effects',
        icon: 'fa-solid fa-person-rays',
        gmOnly: false
    }]);
    CONFIG.ui.sidebar.TABS = Object.fromEntries(tabs);
    // Hooks.on('renderSidebar', effectSidebar);
    // Hooks.on('renderAbstractSidebarTab', effectSidebarTab);
    Hooks.on('hotbarDrop', effectHotbarDrop);
}
export let effectInterface = {
    init,
    //ready,
    patch
    //checkEffectItem
};