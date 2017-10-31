
import * as elementsFactory from '../factory';
import VerticalLayout from '../verticalLayout/VerticalLayoutView';
import HorizontalLayout from '../horizontalLayout/HorizontalLayoutView';
import TabLayoutView from '../tabLayout/TabLayoutView';
import Group from '../group/GroupView';
import Button from '../button/ButtonView';
import Popup from '../popup/PopupView';

export default {
    getContentFromSchema(schema) {
        return this.__parseConfiguration(schema, {})[0];
    },

    __parseConfiguration(schema) {
        return schema.map(child => {
            switch (child.cType) {
                case 'container':
                    switch (child.layout) {
                        case 'vertical':
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
                        case 'horizontal':
                        default:
                            return new HorizontalLayout({
                                columns: this.__parseConfiguration(child.items),
                                visible: child.visible
                            });
                    }
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
                default:
                    return new child.view(_.omit(child, 'view'));
            }
        });
    }
};
