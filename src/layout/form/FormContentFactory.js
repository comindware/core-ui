
import * as elementsFactory from '../factory';
import VerticalLayout from '../verticalLayout/VerticalLayoutView';
import HorizontalLayout from '../horizontalLayout/HorizontalLayoutView';
import TabLayoutView from '../tabLayout/TabLayoutView';
import Group from '../group/GroupView';
import Button from '../button/ButtonView';
import Popup from '../popup/PopupView';
import PlainText from '../plainText/PlainTextView';

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
                                visible: child.visible,
                                title: child.title
                            });
                        case 'tab':
                            return new TabLayoutView({
                                tabs: this.__parseConfiguration(child.items),
                                visible: child.visible,
                                showStepper: child.showStepper,
                                showMoveButtons: child.showMoveButtons,
                                validateBeforeTabSwitch: child.validateBeforeTabSwitch
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
                                visible: child.visible,
                                title: child.title
                            });
                    }
                case 'field':
                    return elementsFactory.createFieldAnchor(child.key, _.omit(child, ['cType', 'key']));
                case 'editor':
                    return elementsFactory.createEditorAnchor(child.key, _.omit(child, ['cType', 'key']));
                case 'popup':
                    return new Popup(_.pick(child, ['size', 'header', 'content']));
                case 'button':
                    return new Button(_.omit(child, 'cType'));
                case 'plainText':
                    return new PlainText(_.omit(child, 'cType'));
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
