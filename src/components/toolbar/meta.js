//@flow
import BlinkCheckboxView from './views/BlinkCheckboxView';
import ActionView from './views/ActionView';
import ActionMenuView from './views/ActionMenuView';
import ToolbarCheckboxItemView from './views/ToolbarCheckboxItemView';
import ToolbarSplitterView from './views/ToolbarSplitterView';
import ToolbarPopupView from './views/ToolbarPopupView';
import ToolbarSelectItemView from './views/ToolbarSelectItemView';
import SearchButtonView from './views/SearchButtonView';
import HeadLineView from './views/HeadLineView';

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
    [toolbarItemType.HEADLINE]: HeadLineView,
    [toolbarItemType.SEARCH]: SearchButtonView
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
    kinds
};
