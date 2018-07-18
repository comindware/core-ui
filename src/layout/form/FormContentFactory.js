// @flow
import * as elementsFactory from '../factory';
import VerticalLayout from '../VerticalLayoutView';
import HorizontalLayout from '../HorizontalLayoutView';
import TabLayoutView from '../tabLayout/TabLayoutView';
import Group from '../group/GroupView';
import Button from '../button/ButtonView';
import Popup from '../popup/PopupView';
import PlainText from '../plainText/PlainTextView';
import GridController from '../../list/controllers/GridController';
import ToolbarView from '../../components/toolbar/ToolbarView';

export default {
    __uniqueFormId: '',

    getContentFromSchema(schema: Array<any>, uniqueFormId: String) {
        this.__uniqueFormId = uniqueFormId;
        return this.__parseConfiguration(schema)[0];
    },

    __parseConfiguration(schema: Array<any>) {
        return schema.map(child => {
            switch (child.type) {
                //auto layout components
                case 'v-container': // vertical layout container
                    return new VerticalLayout(
                        Object.assign({
                            rows: this.__parseConfiguration(child.items)
                        }, child)
                    );
                case 'h-container': // horizontal layout container
                    return new HorizontalLayout(
                        Object.assign({
                            columns: this.__parseConfiguration(child.items)
                        }, child)
                    );
                //complex components
                case 'tab':
                    return new TabLayoutView(
                        Object.assign({
                            tabs: this.__parseConfiguration(child.items)
                        }, child)
                    );
                case 'group':
                    return new Group(
                        Object.assign({
                            view: this.__parseConfiguration(child.items)[0]
                        }, child)
                    );
                case 'Popup':
                case 'popup':
                    return new Popup(_.pick(child, ['size', 'header', 'content']));
                case 'Button':
                case 'button':
                    return new Button({
                        text: child.text,
                        handler: child.handler
                    });
                case 'grid': {
                    const controller = new GridController(child);

                    return controller.view;
                }
                case 'toolbar': {
                    const toolbar = new ToolbarView(child);

                    toolbar.on('command:execute', function (...args) {
                        child.handler.apply(this, args);
                    });

                    return toolbar;
                }
                case 'plainText':
                    return new PlainText(_.omit(child, 'type'));
                case 'custom':
                default: {
                    if (child.type) {
                        if (child.type.includes('field')) {
                            return elementsFactory.createFieldAnchor(
                                child.key,
                                Object.assign(
                                    { uniqueFormId: this.__uniqueFormId },
                                    child,
                                    {
                                        type: child.type.replace('-field', '')
                                    }
                                )
                            );
                        } else if (child.type.includes('editor')) {
                            return elementsFactory.createEditorAnchor(
                                child.key,
                                Object.assign(
                                    { uniqueFormId: this.__uniqueFormId },
                                    child,
                                    {
                                        type: child.type.replace('-editor', '')
                                    }
                                )
                            );
                        }
                    }
                    const childContructor = new child.view(_.omit(child, 'view'));

                    if (child.viewEvents) {
                        Object.keys(child.viewEvents).forEach(key => childContructor.on(key, child.viewEvents[key]));
                    }

                    return childContructor.view ? childContructor.view : childContructor;
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
                                Object.assign({
                                    rows: this.__parseConfiguration(child.items)
                                }, child)
                            );
                        case 'tab':
                            return new TabLayoutView(
                                Object.assign({
                                    tabs: this.__parseConfiguration(child.items)
                                }, child)
                            );
                        case 'group':
                            return new Group(
                                Object.assign({
                                    view: this.__parseConfiguration(child.items)[0]
                                }, child)
                            );
                        case 'horizontal':
                        default:
                            return new HorizontalLayout(
                                Object.assign({
                                    columns: this.__parseConfiguration(child.items)
                                }, child)
                            );
                    }
                case 'field':
                    return elementsFactory.createFieldAnchor(child.key, Object.assign({ uniqueFormId: this.__uniqueFormId }, child));
                case 'editor':
                    return elementsFactory.createEditorAnchor(child.key, Object.assign({ uniqueFormId: this.__uniqueFormId }, child));
                case 'popup':
                    return new Popup(_.pick(child, ['size', 'header', 'content']));
                case 'button':
                case 'Button':
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
