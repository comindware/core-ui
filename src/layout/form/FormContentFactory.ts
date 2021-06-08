import VerticalLayout from '../VerticalLayoutView';
import HorizontalLayout from '../HorizontalLayoutView';
import TabLayoutView from '../tabLayout/TabLayoutView';
import Group from '../group/GroupView';
import Button from '../button/ButtonView';
import Popup from '../popup/PopupView';
import PlainText from '../plainText/PlainTextView';
import GridView from '../../list/views/GridView';
import ToolbarView from '../../components/toolbar/ToolbarView';
import FormFieldAnchor from './FormFieldAnchor';

import { formComponentTypes } from 'Meta';

export default class FormContentFactory {
    static getContentFromSchema(schema: Array<any>, uniqueFormId: String): Backbone.View {
        this.__uniqueFormId = uniqueFormId;
        return this.__parseConfiguration(schema)[0];
    }

    static __parseConfiguration(schema: Array<any>): Array<Backbone.View> {
        return schema.map(this.__parseChildConfiguration.bind(this));
    }

    static __parseChildConfiguration(child: any): Backbone.View {
        switch (child.type) {
            //auto layout components
            case formComponentTypes.verticalLayout: // vertical layout container
                return new VerticalLayout({ ...child, rows: this.__parseConfiguration(child.items) });
            case formComponentTypes.horizontalLayout: // horizontal layout container
                return new HorizontalLayout({ ...child, columns: this.__parseConfiguration(child.items) });
            //complex components
            case formComponentTypes.tabs: {
                const tabs = child.items.map((item: any) => {
                    const { view, ...tabOptions } = item;
                    return {
                        ...tabOptions,
                        view: view ? this.__getView(item) : this.__parseChildConfiguration(item)
                    };
                });
                return new TabLayoutView({ ...child, tabs });
            }
            case formComponentTypes.group:
                return new Group({ ...child, view: this.__parseConfiguration(child.items)[0] });
            case formComponentTypes.popup: {
                const { type, ...options } = child;
                return new Popup({ ...options });
            }
            case formComponentTypes.button: {
                const { type, ...options } = child;
                return new Button({ ...options });
            }
            case formComponentTypes.grid: {
                const { viewEvents, executeAction, ...gridOptions } = child;
                const gridView = new GridView({ ...gridOptions });
                if (typeof executeAction === 'function') {
                    gridView.on('execute', child.executeAction);
                }

                if (viewEvents) {
                    Object.entries(viewEvents).forEach(([key, event]) => gridView.on(key, event));
                }

                return gridView;
            }
            case formComponentTypes.toolbar: {
                const toolbar = new ToolbarView(child);
                if (typeof child.handler === 'function') {
                    toolbar.on('command:execute', child.handler);
                }

                return toolbar;
            }
            case formComponentTypes.plainText: {
                const { type, ...options } = child;
                return new PlainText({ ...options });
            }
            case formComponentTypes.custom:
            default: {
                if (child.type) {
                    const kind = child.type.match(/editor|field/)[0];

                    return new FormFieldAnchor({
                        ...child,
                        uniqueFormId: this.__uniqueFormId,
                        type: child.type.replace(`-${kind}`, ''),
                        kind
                    });
                }
                return this.__getView(child);
            }
        }
    }

    static __getView(child: any): Backbone.View {
        const { view, viewEvents, ...viewOptions } = child;
        const viewInstance = view instanceof Backbone.View ? view : new view({ ...viewOptions });
        if (viewEvents) {
            Object.entries(viewEvents).forEach(([key, event]) => viewInstance.on(key, event));
        }
        return viewInstance;
    }
}
