
import * as elementsFactory from './factory';
import VerticalLayout from './VerticalLayoutView';
import HorizontalLayout from './HorizontalLayoutView';
import TabLayoutView from './tabLayout/TabLayoutView';
import Group from './group/GroupView';
import Button from './button/ButtonView';
import Popup from './popup/PopupView';

export default {
    createCoreView(schema) {
        return this.__parseConfiguration([schema])[0];
    },

    __parseConfiguration(schema) {
        return schema.map(child => {
            switch (child.type) {
                case 'v-container':
                    return new VerticalLayout(Object.assign(child, {
                        rows: this.__parseConfiguration(child.items)
                    }));
                case 'tab':
                    return new TabLayoutView(Object.assign(child, {
                        tabs: this.__parseConfiguration(child.items)
                    }));
                case 'group':
                    return new Group(Object.assign(child, {
                        view: this.__parseConfiguration(child.items)[0],
                    }));
                case 'h-container':
                    return new HorizontalLayout(Object.assign(child, {
                        columns: this.__parseConfiguration(child.items)
                    }));
                case 'popup':
                    return new Popup(_.pick(child, ['size', 'header', 'content']));
                case 'button':
                    return new Button({
                        text: child.text,
                        handler: child.handler
                    });
                case 'custom':
                default: {
                    if (child.type) {
                        if (child.type.indexOf('field') !== -1) {
                            return elementsFactory.createFieldAnchor(child.key);
                        } else if (child.type.indexOf('editor') !== -1) {
                            return elementsFactory.createEditorAnchor(child.key);
                        }
                    }
                    const view = new child.view(_.omit(child, 'view'));
                    if (child.viewEvents) {
                        Object.keys(child.viewEvents).forEach(key => view.on(key, child.viewEvents[key]));
                    }
                    return view;
                }
            }
        });
    }
};
