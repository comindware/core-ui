
import * as elementsFactory from './factory';
import VerticalLayout from './verticalLayout/VerticalLayoutView';
import HorizontalLayout from './horizontalLayout/HorizontalLayoutView';
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
                    return new VerticalLayout({
                        rows: this.__parseConfiguration(child.items),
                        visible: child.visible
                    });
                case 'tab':
                    return new TabLayoutView({
                        tabs: this.__parseConfiguration(child.items),
                        visible: child.visible
                    });
                case 'group':
                    return new Group({
                        view: this.__parseConfiguration(child.items)[0],
                        visible: child.visible,
                        name: child.name
                    });
                case 'h-container':
                    return new HorizontalLayout({
                        columns: this.__parseConfiguration(child.items),
                        visible: child.visible
                    });
                case 'field':
                    return elementsFactory.createFieldAnchor(child.key);
                case 'editor':
                    return elementsFactory.createEditorAnchor(child.key);
                case 'popup':
                    return new Popup(_.pick(child, ['size', 'header', 'content']));
                case 'button':
                    return new Button({
                        text: child.text,
                        handler: child.handler
                    });
                case 'custom':
                default: {
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
