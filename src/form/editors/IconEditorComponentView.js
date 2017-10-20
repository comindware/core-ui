/**
 * Developer: Zaycev Ivan
 * Date: 29.06.2017
 * Copyright: 2009-2017 Comindware®
 *       All Rights Reserved
 *
 * THIS IS UNPUBLISHED PROPRIETARY SOURCE CODE OF Comindware
 *       The copyright notice above does not evidence any
 *       actual or intended publication of such source code.
 */

import IconButtonView from './impl/awesomeIconEditor/views/IconButtonView';
import IconPanelView from './impl/awesomeIconEditor/views/IconPanelView';
import template from './impl/awesomeIconEditor/templates/iconEditorComponentView.html';
import { iconPalette } from './impl/awesomeIconEditor/iconPalette';
import dropdownFactory from '../../dropdown/factory';
import formRepository from '../formRepository';

const constants = {
    iconPropertyDefaultName: 'iconClass'
};

/*
 * options parameters:
 *
 * @param model
 * @param modelIconProperty - name of model property. 'iconClass' as default
 */

export default formRepository.IconEditor = Marionette.LayoutView.extend({
    initialize(options) {
        const modelIconProperty = options.modelIconProperty;
        if (modelIconProperty && modelIconProperty !== constants.iconPropertyDefaultName) {
            this.model.set('iconClass', this.model.get(options.modelIconProperty));
        }
    },

    template: Handlebars.compile(template),

    className: 'icon-editor-wrp',

    regions: {
        iconSelectorHeader: '.js-icon-selector-header'
    },

    ui: {
        deleteIconButton: '.js-delete-icon'
    },

    events: {
        'click @ui.deleteIconButton': '__onDeleteIconClick'
    },

    onRender() {
        this.popupPanel = dropdownFactory.createPopout({
            buttonView: IconButtonView,
            panelView: IconPanelView,
            buttonViewOptions: {
                model: this.model
            },
            panelViewOptions: {
                collection: this.__getConfig()
            },
            customAnchor: true
        });

        this.popupPanel.on('panel:click:item', id => {
            this.ui.deleteIconButton.show();
            this.model.set('iconClass', id);
            this.trigger('click:item', id);
        });

        this.iconSelectorHeader.show(this.popupPanel);
        if (!this.model.get('iconClass')) {
            this.ui.deleteIconButton.hide();
        }
    },

    __getConfig() {
        const groupItems = [];
        const groupItemsObj = this.__groupIcon();
        const groupItemsNames = Object.keys(groupItemsObj);
        _.each(groupItemsNames, item => {
            groupItems.push({
                name: item,
                groupItems: groupItemsObj[item]
            });
        });
        return new Backbone.Collection(groupItems);
    },

    __onDeleteIconClick() {
        this.model.set('iconClass', null);
        this.trigger('click:item', null);
        this.ui.deleteIconButton.hide();
        this.popupPanel.render();
    },

    close() {
        this.popupPanel.close();
    },

    __groupIcon() {
        const groupItemsObj = {};
        _.each(iconPalette, item => {
            _.each(item.categories, categoryItem => {
                if (!groupItemsObj[categoryItem]) {
                    groupItemsObj[categoryItem] = [];
                }
                groupItemsObj[categoryItem].push(item);
            });
        });
        return groupItemsObj;
    }
});
