//@flow
import BlinkCheckboxView from './views/BlinkCheckboxView';
import ActionView from './views/ActionView';
import ActionMenuView from './views/ActionMenuView';
import ToolbarCheckboxItemView from './views/ToolbarCheckboxItemView';
import ToolbarSplitterView from './views/ToolbarSplitterView';
import ToolbarPopupView from './views/ToolbarPopupView';
import ToolbarSelectItemView from './views/ToolbarSelectItemView';
import SearchButtonView from './views/SearchButtonView';
import SplitButtonView from './views/SplitButtonView';
import HeadLineView from './views/HeadLineView';

const __getSeverity = (classPrefix = 'toolbar-btn') => ({
    None: {
        class: classPrefix,
        text: 'None',
        id: 'None'
    },
    Low: {
        class: `${classPrefix} ${classPrefix}_low`,
        text: 'Low',
        id: 'Low'
    },
    Normal: {
        class: `${classPrefix} ${classPrefix}_normal`,
        text: 'Normal',
        id: 'Normal'
    },
    Major: {
        class: `${classPrefix} ${classPrefix}_major`,
        text: 'Major',
        id: 'Major'
    },
    Critical: {
        class: `${classPrefix} ${classPrefix}_critical`,
        text: 'Critical',
        id: 'Critical'
    },
    Fatal: {
        class: `${classPrefix} ${classPrefix}_fatal`,
        text: 'Fatal',
        id: 'Fatal'
    }
});

export const severity = __getSeverity();

export const toolbarItemType = {
    ACTION: 'Action',
    GROUP: 'Group',
    SPLITTER: 'Splitter',
    POPUP: 'Popup',
    CHECKBOX: 'Checkbox',
    SELECTITEM: 'SelectItem',
    BLINKCHECKBOX: 'BlinkCheckbox',
    SELECTSTATE: 'SelectState',
    HEADLINE: 'Headline',
    SEARCH: 'Search',
    SPLITBUTTON: 'SplitButton'
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
    [toolbarItemType.SEARCH]: SearchButtonView,
    [toolbarItemType.SPLITBUTTON]: SplitButtonView
};

const getViewByModel = model => viewsByType[model.get('type')] || ActionView;

export const getClassName = (prefix, model, isSplitButton = false) => {
    const string = model.get('type');
    const type = typeof string === 'string' ? string.charAt(0).toLowerCase() + string.slice(1) : 'withoutType';
    const severityObject = __getSeverity(isSplitButton ? 'split-btn' : 'toolbar-btn');
    const severityItem = severityObject[model.get('severity')] || severityObject.None;
    return `${prefix} ${severityItem.class} ${model.get('class') || ''} toolbar-btn_${type}`;
};

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
