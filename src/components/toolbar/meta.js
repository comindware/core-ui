//@flow
import BlinkCheckboxView from './views/BlinkCheckboxView';
import ActionView from './views/ActionView';
import ActionMenuView from './views/ActionMenuView';
import ToolbarCheckboxItemView from './views/ToolbarCheckboxItemView';
import ToolbarSplitterView from './views/ToolbarSplitterView';
import ToolbarPopupView from './views/ToolbarPopupView';
import ToolbarSelectItemView from './views/ToolbarSelectItemView';
import ButtonView from './views/ButtonView';
import SearchBarView from '../../views/SearchBarView';

export const severity = {
    None: {
        class: 'toolbar-btn',
        text: 'None',
        id: 'None'
    },
    Low: {
        class: 'toolbar-btn toolbar-btn_low',
        text: 'Low',
        id: 'Low'
    },
    Normal: {
        class: 'toolbar-btn toolbar-btn_normal',
        text: 'Normal',
        id: 'Normal'
    },
    Major: {
        class: 'toolbar-btn toolbar-btn_major',
        text: 'Major',
        id: 'Major'
    },
    Critical: {
        class: 'toolbar-btn toolbar-btn_critical',
        text: 'Critical',
        id: 'Critical'
    },
    Fatal: {
        class: 'toolbar-btn toolbar-btn_fatal',
        text: 'Fatal',
        id: 'Fatal'
    }
};

export const icons = {
    Undefined: {
        text: 'None',
        id: 'Undefined',
        icon: '<svg></svg>'
    },
    None: {
        text: 'None',
        id: 'None',
        icon: '<svg></svg>'
    },
    Plus: {
        text: 'Plus',
        id: 'Plus',
        icon:
            '<svg viewBox="0 0 14 14"><path class="d-svg-icons d-svg-icons_plus" d="M13,6H8V1c0-0.6-0.4-1-1-1S6,0.4,6,1v5H1C0.4,6,0,6.4,0,7s0.4,1,1,1h5v5c0,0.6,0.4,1,1,1s1-0.4,1-1V8h5 c0.6,0,1-0.4,1-1S13.6,6,13,6z"/></svg>'
    },
    Minus: {
        text: 'Minus',
        id: 'Minus',
        icon: '<svg viewBox="0 0 14 14"><path class="d-svg-icons d-svg-icons_minus" d="M2,6h10c0.6,0,1,0.4,1,1s-0.4,1-1,1H2C1.4,8,1,7.6,1,7S1.4,6,2,6z"/></svg>'
    },
    Clone: {
        text: 'Clone',
        id: 'Clone',
        icon:
            '<svg viewBox="0 0 14 14"><path class="d-svg-icons d-svg-icons_clone" d="M10,3H1C0.4,3,0,3.4,0,4v9c0,0.6,0.4,1,1,1h9c0.6,0,1-0.4,1-1V4C11,3.4,10.6,3,10,3z M10,12c0,0.6-0.4,1-1,1H2 c-0.6,0-1-0.4-1-1V5c0-0.6,0.4-1,1-1h7c0.6,0,1,0.4,1,1V12z M9,6H2V5h7V6z M9,8H2V7h7V8z M9,10H2V9h7V10z M7,12H2v-1h5V12z"/><path class="d-svg-icons d-svg-icons_clone" d="M13,0H4C3.4,0,3,0.4,3,1v2h1V2c0-0.6,0.4-1,1-1h7c0.6,0,1,0.4,1,1v7c0,0.6-0.4,1-1,1h-1v1h2c0.6,0,1-0.4,1-1V1 C14,0.4,13.6,0,13,0z"/></svg>'
    },
    Envelope: {
        text: 'Envelope',
        id: 'Envelope',
        icon:
            '<svg viewBox="0 0 14 14"><path class="d-svg-icons d-svg-icons_envelope" d="M0.9,1.9C0,1.9,0,2.8,0,2.8l5.5,5.1c1.5,1,2.8,0,2.8,0L14,2.8c0-0.9-0.9-1-0.9-1H0.9z"/><path class="d-svg-icons d-svg-icons_envelope" d="M0,3.7l2.8,2.8L0.9,11l2.7-3.5l1.8,1.4c0,0,2,1,3.1,0l1.7-1.5l2.8,3.7l-1.9-4.7L14,3.7v7.5c0,0-0.1,0.9-1,0.9 H1c0,0-1-0.1-1-0.9V3.7z"/></svg>'
    },
    Pencil: {
        text: 'Pencil',
        id: 'Pencil',
        icon:
            '<svg viewBox="0 0 14 14"><path class="d-svg-icons d-svg-icons_pencil" d="M12,0.3c0,0-0.5-0.7-1.1-0.1L9.7,1.5l2.9,2.8l1.1-1.1c0,0,0.6-0.4,0-1L12,0.3z"/><path class="d-svg-icons d-svg-icons_pencil" d="M8.9,2.2l-7,7l3.1,2.7L12,5.1L8.9,2.2z"/><path class="d-svg-icons d-svg-icons_pencil" d="M1.1,10.1L0,14l4.2-1.3L1.1,10.1z"/></svg>'
    },
    Search: {
        text: 'Search',
        id: 'Search',
        icon:
            '<svg viewBox="0 0 14 14"><path class="d-svg-icons d-svg-icons_search"  d="M13.6,12.1l-4-3.8c0.6-0.8,1.3-2.1,1.3-3.3c0-2.9-2.6-5-5.5-5C2.5,0,0.3,2.1,0.3,5c0,2.9,2.2,5.5,5.1,5.5 c0.8,0,1.8-0.4,2.4-0.7l4.1,4.1c0.2,0.2,0.6,0.2,0.9,0l0.9-0.9C13.8,12.7,13.8,12.3,13.6,12.1z M5.6,8.7C3.6,8.7,2,7.2,2,5.2 s1.6-3.5,3.5-3.5c1.9,0,3.5,1.6,3.5,3.5S7.5,8.7,5.6,8.7z"/></svg>'
    },
    Ok: {
        text: 'Ok',
        id: 'Ok',
        icon: '<svg viewBox="0 0 14 14"><polygon class="d-svg-icons d-svg-icons_ok" points="14,3.7 12.5,2.2 5.5,9 1.6,4.9 0,6.6 5.4,12.2 "/></svg>'
    },
    User: {
        text: 'User',
        id: 'User',
        icon:
            '<svg viewBox="0 0 14 14"><path class="d-svg-icons d-svg-icons_user" d="M6.4,0.6c-0.5,0-0.1,0.2-0.3,0.2c-0.3,0,0.3,0-0.4,0.1C4.8,1,4.7,2,4.6,2.4c0,0.4,0,0.5,0,1.1 c0.1,0.3-0.3,0.3-0.3,0.3c-0.5,0-0.6,1.4-0.6,1.4c0.1,0.4,0,0.5,0.7,0.8C4.8,7,5.6,7.5,5.6,7.5s0,0.6,0.1,1c-0.1,0-0.1,1.1-2.3,1.4 c-2.2,0.3-2.6,1-3,1.4C0,11.8,0,13.6,0,13.6h14c0,0-0.1-1.8-0.5-2.2c-0.4-0.4-0.9-1.1-3-1.4c-2.2-0.3-2-1.4-2-1.5 c0-0.2,0.1-0.9,0.1-0.9S9.2,7,9.5,6c0.5-0.3,0.7-0.4,0.8-0.8c0,0,0.2-1.4-0.3-1.4c0,0-0.6,0-0.6-0.3c0.1-0.3,0.1-0.5,0-0.8 c0-0.4,0.2-1.4-0.6-1.6C8.3,1,8.5,1.2,8.2,1.1C8,1.1,7.7,0.4,7.2,0.4L6.4,0.6z"/></svg>'
    },
    List: {
        text: 'List',
        id: 'List',
        icon:
            '<svg viewBox="0 0 14 14"><path class="d-svg-icons d-svg-icons_list" d="M11.5,0h-9c-0.6,0-1,0.4-1,1v12c0,0.6,0.4,1,1,1h6.9l3.1-3V1C12.5,0.4,12.1,0,11.5,0z M3.5,2h7v1h-7V2z M3.5,5 h7v1h-7V5z M3.5,8h7v1h-7V8z M6.5,12h-3v-1h3V12z M11.6,10.3L8.8,13c-0.4,0.4-0.3-0.3-0.3-0.3V11c0-1,1.2-1,1.2-1h1.8 C12.1,9.9,11.6,10.3,11.6,10.3z"/></svg>'
    },
    Remove: {
        text: 'Remove',
        id: 'Remove',
        icon:
            '<svg viewBox="0 0 14 14"><polygon  class="d-svg-icons d-svg-icons_remove" points="14,1.8 12.2,0 7,5.2 1.8,0 0,1.8 5.2,7 0,12.2 1.8,14 7,8.8 12.2,14 14,12.2 8.8,7 "/></svg>'
    },
    Trash: {
        text: 'Trash',
        id: 'Trash',
        icon:
            '<svg viewBox="0 0 14 14"><path class="d-svg-icons d-svg-icons_trash" d="M13.1,2.8h-2.8V0.9c0,0-0.1-0.9-1-0.9L4.7,0c0,0-1,0-1,0.9l0,1.8H0.8c-0.9,0-0.8,0.7-0.8,1C0,4,0,4.7,0.8,4.7 h1.1l-0.1,7.5c0,0,0.1,1.8,1.9,1.8h6.5c0,0,1.8-0.1,1.8-1.8l0-7.5h1C13.9,4.7,14,4,14,3.7C14,3.5,13.9,2.8,13.1,2.8z M4.6,11.7 c0,0.2-0.2,0.4-0.5,0.4c-0.2,0-0.4-0.2-0.4-0.4V5.1c0-0.2,0.2-0.4,0.4-0.4c0.2,0,0.5,0.2,0.5,0.4V11.7z M7.5,11.7 c0,0.3-0.2,0.5-0.5,0.5c-0.3,0-0.5-0.2-0.5-0.5V5.1c0-0.3,0.2-0.5,0.5-0.5c0.3,0,0.5,0.2,0.5,0.5V11.7z M4.6,2.8c0-0.9,1-0.9,1-0.9 l2.8,0c0,0,0.9,0,0.9,0.9H4.6z M10.2,11.7c0,0.2-0.2,0.5-0.5,0.5c-0.2,0-0.5-0.2-0.5-0.5V5.2c0-0.2,0.2-0.5,0.5-0.5 c0.2,0,0.5,0.2,0.5,0.5V11.7z"/></svg>'
    },
    Cog: {
        text: 'Cog',
        id: 'Cog'
    },
    Star: {
        text: 'Star',
        id: 'Star'
    },
    Asterisk: {
        text: 'Asterisk',
        id: 'Asterisk'
    },
    Home: { text: 'Home', id: 'Home' },
    File: { text: 'File', id: 'File' },
    Time: {
        text: 'Time',
        id: 'Time',
        icon:
            '<svg viewBox="0 0 14 14"><path class="d-svg-icons d-svg-icons_date" d="M12.9,1.1h-1.1v1c0,0-0.1,1.2-1.6,1.2c0,0-1.6,0-1.6-1.2l0-1H5.4v1c0,0,0,1.2-1.6,1.2c0,0-1.7-0.1-1.7-1.1v-1 H1.1C0.5,1.1,0,1.6,0,2.2v10.8C0,13.5,0.5,14,1.1,14h11.8c0.6,0,1.1-0.5,1.1-1.1V2.2C14,1.6,13.5,1.1,12.9,1.1z M3.2,12.9H1.1v-2.2 h2.2V12.9z M3.2,9.7H1.1V7.5h2.2V9.7z M3.2,6.5H1.1V4.3h2.2V6.5z M6.5,12.9H4.3v-2.2h2.2V12.9z M6.5,9.7H4.3V7.5h2.2V9.7z M6.5,6.5 H4.3V4.3h2.2V6.5z M9.7,12.9H7.5v-2.2h2.2V12.9z M9.7,9.7H7.5V7.5h2.2V9.7z M9.7,6.5H7.5V4.3h2.2V6.5z M12.9,12.9h-2.2v-2.2h2.2 V12.9z M12.9,9.7h-2.2V7.5h2.2V9.7z M12.9,6.5h-2.2V4.3h2.2V6.5z"/><path class="d-svg-icons d-svg-icons_date" d="M3.8,2.2c0.3,0,0.5-0.2,0.5-0.5V0.5C4.3,0.2,4.1,0,3.8,0C3.5,0,3.2,0.2,3.2,0.5v1.1C3.2,1.9,3.5,2.2,3.8,2.2z" /><path class="d-svg-icons d-svg-icons_date" d="M10.2,2.2c0.3,0,0.5-0.2,0.5-0.5V0.5c0-0.3-0.2-0.5-0.5-0.5C9.9,0,9.7,0.2,9.7,0.5v1.1 C9.7,1.9,9.9,2.2,10.2,2.2z"/></svg>'
    },
    Print: { text: 'Print', id: 'Print' },
    Download: { text: 'Download', id: 'Download' },
    Upload: { text: 'Upload', id: 'Upload' },
    Refresh: {
        text: 'Refresh',
        id: 'Refresh',
        icon:
            '<svg viewBox="0 0 14 14"><path class="d-svg-icons d-svg-icons_refresh" d="M2.2,7c0-2.7,2.1-5,4.9-5c2.5,0,3.2,1.4,3.3,1.3L8.6,4.8C7.8,5.6,8.7,5.6,8.7,5.6l4.8,0 C14.1,5.7,14,5.2,14,5.2l0-4.8c0-0.8-0.8,0-0.8,0l-1.3,1.6c0,0-1.9-1.8-4.7-1.8C3.2,0.2,0,3.2,0,7c0,0,0,0.8,1.1,0.8 C1.1,7.8,2.2,7.8,2.2,7z"/><path class="d-svg-icons d-svg-icons_refresh" d="M11.8,6.9c0,2.7-2.1,5-4.9,5c-2.5,0-3.2-1.4-3.3-1.3l1.8-1.5c0.8-0.8-0.1-0.8-0.1-0.8l-4.8,0 C-0.1,8.3,0,8.8,0,8.8l0,4.8c0,0.8,0.8,0,0.8,0L2.1,12c0,0,1.9,1.8,4.7,1.8c3.9,0,7.1-3.1,7.1-6.9c0,0,0-0.8-1.1-0.8 C12.9,6.2,11.8,6.2,11.8,6.9z"/></svg>'
    },
    Repeat: { text: 'Repeat', id: 'Repeat' },
    Info: { text: 'Info', id: 'Info' },
    Warning: { text: 'Warning', id: 'Warning' },
    Exclamation: { text: 'Exclamation', id: 'Exclamation' },
    Cart: { text: 'Cart', id: 'Cart' },
    Play: { text: 'Play', id: 'Play' },
    Comment: { text: 'Comment', id: 'Comment' },
    Folder: { text: 'Folder', id: 'Folder' },
    Bell: { text: 'Bell', id: 'Bell' },
    Flash: { text: 'Flash', id: 'Flash' },
    Picture: { text: 'Picture', id: 'Picture' },
    Book: { text: 'Book', id: 'Book' }
};

const toolbarItemType = {
    ACTION: 'Action',
    GROUP: 'Group',
    SPLITTER: 'Splitter',
    POPUP: 'Popup',
    CHECKBOX: 'Checkbox',
    SELECTITEM: 'SelectItem',
    BLINKCHECKBOX: 'BlinkCheckbox',
    SELECTSTATE: 'SelectState',
    HEADLINE: 'Headline',
    SEARCH: 'Search'
};

const viewsByType = {
    [toolbarItemType.ACTION]: ActionView,
    [toolbarItemType.GROUP]: ActionMenuView,
    [toolbarItemType.SELECTSTATE]: ActionMenuView,
    [toolbarItemType.SPLITTER]: ToolbarSplitterView,
    [toolbarItemType.POPUP]: ToolbarPopupView,
    [toolbarItemType.CHECKBOX]: ToolbarCheckboxItemView,
    [toolbarItemType.SELECTITEM]: ToolbarSelectItemView,
    [toolbarItemType.BLINKCHECKBOX]: BlinkCheckboxView,
    [toolbarItemType.HEADLINE]: ButtonView,
    [toolbarItemType.SEARCH]: SearchBarView
};

const getViewByModel = model => viewsByType[model.get('type')] || ActionView;

const kinds = {
    CONST: 'Const'
};

export default {
    toolbarItemType,
    getViewByModel,
    viewsByType,
    severity,
    kinds,
    icons
};
