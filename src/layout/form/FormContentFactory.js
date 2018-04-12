// @flow
import * as elementsFactory from '../factory';
import VerticalLayout from '../VerticalLayoutView';
import HorizontalLayout from '../HorizontalLayoutView';
import TabLayoutView from '../tabLayout/TabLayoutView';
import Group from '../group/GroupView';
import Button from '../button/ButtonView';
import Popup from '../popup/PopupView';
import PlainText from '../plainText/PlainTextView';

export default {
    __uniqueFormId: '',

    getContentFromSchema(schema: Array<any>, uniqueFormId: String) {
        this.__uniqueFormId = uniqueFormId;
        return this.__parseConfiguration(schema)[0];
    },

    __parseConfiguration(schema: Array<any>) {
        return schema.map(child => {
            switch (child.type) {
                case 'v-container':
                    return new VerticalLayout(
                        Object.assign(child, {
                            rows: this.__parseConfiguration(child.items)
                        })
                    );
                case 'tab':
                    return new TabLayoutView(
                        Object.assign(child, {
                            tabs: this.__parseConfiguration(child.items)
                        })
                    );
                case 'group':
                    return new Group(
                        Object.assign(child, {
                            view: this.__parseConfiguration(child.items)[0]
                        })
                    );
                case 'h-container':
                    return new HorizontalLayout(
                        Object.assign(child, {
                            columns: this.__parseConfiguration(child.items)
                        })
                    );
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
                        if (child.type.includes('field') !== -1) {
                            return elementsFactory.createFieldAnchor(
                                child.key,
                                Object.assign(
                                    child,
                                    {
                                        type: child.type.replace('-field', '')
                                    },
                                    { uniqueFormId: this.__uniqueFormId }
                                )
                            );
                        } else if (child.type.includes('editor') !== -1) {
                            return elementsFactory.createEditorAnchor(
                                child.key,
                                Object.assign(
                                    child,
                                    {
                                        type: child.type.replace('-editor', '')
                                    },
                                    { uniqueFormId: this.__uniqueFormId }
                                )
                            );
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
    },

    __parseConfigurationOld(schema: Array<any>) {
        return schema.map(child => {
            switch (child.cType) {
                case 'container':
                    switch (child.layout) {
                        case 'vertical':
                            return new VerticalLayout(
                                Object.assign(child, {
                                    rows: this.__parseConfiguration(child.items)
                                })
                            );
                        case 'tab':
                            return new TabLayoutView(
                                Object.assign(child, {
                                    tabs: this.__parseConfiguration(child.items)
                                })
                            );
                        case 'group':
                            return new Group(
                                Object.assign(child, {
                                    view: this.__parseConfiguration(child.items)[0]
                                })
                            );
                        case 'horizontal':
                        default:
                            return new HorizontalLayout(
                                Object.assign(child, {
                                    columns: this.__parseConfiguration(child.items)
                                })
                            );
                    }
                case 'field':
                    return elementsFactory.createFieldAnchor(child.key, Object.assign(child, { uniqueFormId: this.__uniqueFormId }));
                case 'editor':
                    return elementsFactory.createEditorAnchor(child.key, Object.assign(child, { uniqueFormId: this.__uniqueFormId }));
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
