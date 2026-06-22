class HiddenCompendiumSelector extends foundry.applications.api.DialogV2 {
    constructor(options = {}) {
        const folderMap = new Map();
        const rootFolders = [];
        const rootPacks = [];
        const savedData = game.settings.get('side-effects', 'hiddenCompendiums') || {folders: [], packs: []};
        const savedFolders = savedData.folders || [];
        const savedPacks = savedData.packs || [];
        for (const pack of game.packs) {
            if (!pack.folder) {
                rootPacks.push(pack);
                continue;
            }
            let currentFolder = pack.folder;
            while (currentFolder) {
                if (!folderMap.has(currentFolder.id)) {
                    folderMap.set(currentFolder.id, {
                        id: currentFolder.id,
                        name: currentFolder.name,
                        color: currentFolder.color || 'inherit',
                        children: [],
                        packs: [],
                        parent: currentFolder.folder?.id || null 
                    });
                }
                currentFolder = currentFolder.folder;
            }
            folderMap.get(pack.folder.id).packs.push(pack);
        }
        for (const folder of folderMap.values()) {
            if (folder.parent && folderMap.has(folder.parent)) {
                folderMap.get(folder.parent).children.push(folder);
            } else {
                rootFolders.push(folder); 
            }
        }
        const isFolderCovered = (folderId) => {
            let curr = folderMap.get(folderId);
            while (curr) {
                if (savedFolders.includes(curr.id)) return true;
                curr = curr.parent ? folderMap.get(curr.parent) : null;
            }
            return false;
        };
        const renderPackHtml = (pack) => {
            const id = pack.collection;
            const label = pack.metadata.label;
            const source = pack.metadata.packageName;
            const docType = pack.metadata.type;
            const icon = CONFIG[docType]?.sidebarIcon || 'fa-solid fa-box';
            const isChecked = savedPacks.includes(id) || (pack.folder && isFolderCovered(pack.folder.id)) ? 'checked' : '';
            return `
                <label style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px; cursor: pointer;">
                <input type="checkbox" name="${id}" class="pack-checkbox" ${isChecked}>
                <i class="${icon}" style="color: var(--color-text-light-5);"></i>
                <span>${label} <span style="opacity: 0.7; font-size: 0.9em; font-style: italic;">(${source})</span></span>
                </label>
            `;
        };
        const renderFolderHtml = (folder) => {
            const isChecked = isFolderCovered(folder.id) ? 'checked' : '';
            return `
                <div class="folder-group" style="margin-bottom: 8px;">
                <label style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px; cursor: pointer; font-weight: bold; color: ${folder.color};">
                    <input type="checkbox" class="folder-checkbox" data-folder-id="${folder.id}" ${isChecked}>
                    <i class="fa-solid fa-folder"></i>
                    <span>${folder.name}</span>
                </label>
                <div class="folder-contents" style="margin-left: 24px;">
                    ${folder.children.map(renderFolderHtml).join('')}
                    ${folder.packs.map(renderPackHtml).join('')}
                </div>
                </div>
            `;
        };
        let listHtml = `<div style="display: flex; flex-direction: column; padding-top: 0.5rem;">`;
        listHtml += rootFolders.map(renderFolderHtml).join('');
        if (rootPacks.length) {
            listHtml += `<div style="margin-top: 8px;">${rootPacks.map(renderPackHtml).join('')}</div>`;
        }
        listHtml += `</div>`;
        const content = `
            <fieldset style="max-height: 400px; overflow-y: auto; margin-bottom: 0.5rem;">
                <legend>${_loc('SIDEEFFECTS.Macros.HiddenCompendiums.Legend')}</legend>
                ${listHtml}
            </fieldset>
        `;
        super({
            window: {title: 'SIDEEFFECTS.Macros.HiddenCompendiums.Label'},
            content: content,
            buttons: [{
                action: 'save',
                label: 'SETTINGS.Save',
                icon: 'fa-solid fa-save',
                default: true,
                callback: async (event, button, dialog) => {
                    const form = button.form;
                    const folders = [];
                    const packs = [];
                    const hasCheckedParent = (el) => {
                        let parentGroup = el.closest('.folder-contents')?.closest('.folder-group');
                        while (parentGroup) {
                            if (parentGroup.querySelector(':scope > label > .folder-checkbox').checked) return true;
                            parentGroup = parentGroup.parentElement.closest('.folder-contents')?.closest('.folder-group');
                        }
                        return false;
                    };
                    form.querySelectorAll('.folder-checkbox:checked').forEach(cb => {
                        if (!hasCheckedParent(cb)) folders.push(cb.dataset.folderId);
                    });
                    form.querySelectorAll('.pack-checkbox:checked').forEach(cb => {
                        if (!hasCheckedParent(cb)) packs.push(cb.name);
                    });
                    const result = {folders, packs};
                    await game.settings.set('side-effects', 'hiddenCompendiums', result);
                }
            }],
            ...options
        });
    }
    _onRender(context, options) {
        super._onRender(context, options); 
        const html = this.element;
        html.querySelectorAll('.folder-group').forEach(group => {
            const packs = Array.from(group.querySelectorAll('.pack-checkbox'));
            const folderCb = group.querySelector(':scope > label > .folder-checkbox');
            if (packs.length > 0 && packs.every(p => p.checked)) {
                if (folderCb) folderCb.checked = true;
            }
        });
        html.querySelectorAll('.folder-checkbox').forEach(folderCb => {
            folderCb.addEventListener('change', (e) => {
                const isChecked = e.target.checked;
                const group = e.target.closest('.folder-group');
                group.querySelectorAll("input[type='checkbox']").forEach(cb => {
                    cb.checked = isChecked;
                });
            });
        });
        html.querySelectorAll('.pack-checkbox, .folder-checkbox').forEach(cb => {
            cb.addEventListener('change', (e) => {
                if (!e.target.checked) {
                    let parentGroup = e.target.closest('.folder-contents')?.closest('.folder-group');
                    while (parentGroup) {
                        const parentCb = parentGroup.querySelector(':scope > label > .folder-checkbox');
                        if (parentCb) parentCb.checked = false;
                        parentGroup = parentGroup.parentElement.closest('.folder-contents')?.closest('.folder-group');
                    }
                }
            });
        });
    }
}
function removeCompendiums(directory) {
    if (!(directory instanceof foundry.applications.sidebar.tabs.CompendiumDirectory)) return;
    let html = directory.element;
    let ol = html.querySelectorAll('ol.directory-list');
    let lis = Object.values(ol).flatMap(i => Object.values(i.querySelectorAll('li')));
    let {folders, packs} = game.settings.get('side-effects', 'hiddenCompendiums');
    Object.values(lis).filter(i => i.localName === 'li').forEach(element => {
        let pack = element.dataset.pack;
        let folderId = element.dataset.folderId;
        if (!pack && !folderId) return;
        if (pack && packs.includes(pack)) {
            element.remove();
            return;
        } else if (folderId) {
            if (folders.includes(folderId)) element.remove();
            return;
        }
    });
}
function toggle(enabled) {
    Hooks.on('renderCompendiumDirectory', removeCompendiums);
    Hooks.on('changeSidebarTab', removeCompendiums);
}
export let hiddenCompendiums = {
    toggle,
    HiddenCompendiumSelector
};