/**
 * Developer: Ksenia Kartvelishvili
 * Date: 11.02.2015
 * Copyright: 2009-2015 Comindware®
 *       All Rights Reserved
 *
 * THIS IS UNPUBLISHED PROPRIETARY SOURCE CODE OF Comindware
 *       The copyright notice above does not evidence any
 *       actual or intended publication of such source code.
 */

import template from './templates/contextSelectEditor.html';
import PopoutPanelView from './impl/context/views/PopoutPanelView';
import PopoutButtonView from './impl/context/views/PopoutButtonView';
import ContextModel from './impl/context/models/ContextModel';
import formRepository from '../formRepository';
import BaseLayoutEditorView from './base/BaseLayoutEditorView';
import dropdownFactory from '../../dropdown/factory';

const defaultOptions = {
    recordTypeId: undefined,
    context: undefined,
    propertyTypes: undefined,
    usePropertyTypes: true,
    popoutFlow: 'left',
    allowBlank: false,
    instanceRecordTypeId: undefined
};

formRepository.editors.ContextSelect = BaseLayoutEditorView.extend({
    initialize(options = {}) {
        _.defaults(this.options, _.pick(options.schema ? options.schema : options, Object.keys(defaultOptions)), defaultOptions);

        const model = new ContextModel({
            instanceTypeId: this.options.recordTypeId,
            context: this.options.context,
            propertyTypes: this.options.propertyTypes,
            usePropertyTypes: this.options.usePropertyTypes,
            instanceRecordTypeId: this.options.instanceRecordTypeId,
            allowBlank: this.options.allowBlank
        });

        this.viewModel = new Backbone.Model({
            button: new Backbone.Model(),
            panel: model
        });

        const buttonValue = this.__getButtonText(this.getValue());
        this.viewModel.get('button').set('value', buttonValue);
    },

    focusElement: null,

    attributes: {
        tabindex: 0
    },

    regions: {
        contextPopoutRegion: '.js-context-popout-region'
    },

    template: Handlebars.compile(template),

    onRender() {
        if (!this.enabled) {
            this.contextPopoutRegion.show(new PopoutButtonView({
                model: this.viewModel.get('button')
            }));
            return;
        }

        this.popoutView = dropdownFactory.createPopout({
            panelView: PopoutPanelView,
            panelViewOptions: {
                model: this.viewModel.get('panel')
            },
            buttonView: PopoutButtonView,
            buttonViewOptions: {
                model: this.viewModel.get('button')
            },
            popoutFlow: this.options.popoutFlow
        });
        this.contextPopoutRegion.show(this.popoutView);
        this.listenTo(this.popoutView, 'before:open', () => {
            const model = this.viewModel.get('panel');
            model.populateChildren();
            model.selectPath(this.getValue());
        });
        this.listenTo(this.popoutView, 'element:path:select', this.__applyContext);
    },

    setValue(value) {
        this.__value(value, false);
    },

    updateContext(recordTypeId, context) {
        const panelModel = this.viewModel.get('panel');
        panelModel.set('instanceTypeId', recordTypeId);
        panelModel.set('context', context);
        this.setValue();
    },

    __value(value, triggerChange) {
        if (this.value === value) {
            return;
        }
        this.value = value;
        if (triggerChange) {
            this.__triggerChange();
        }
        this.viewModel.get('button').set('value', this.__getButtonText(value));
    },

    __getButtonText(selectedItem) {
        const panelModel = this.viewModel.get('panel');
        if (!selectedItem || selectedItem === 'False') return '';
        let instanceTypeId = panelModel.get('instanceTypeId');

        const buttonText = selectedItem.map(id => {
            let text = '';
            panelModel.get('context')[instanceTypeId].forEach(context => {
                if (context.id === id) {
                    text = context.name;
                    instanceTypeId = context.instanceTypeId;
                    return false;
                }
            });
            return text;
        });

        return _.without(buttonText, false).join('/');
    },

    __applyContext(selected) {
        this.popoutView.close();
        this.__value(selected, true);
    }
});

export default formRepository.editors.ContextSelect;
