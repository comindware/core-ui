/**
 * Developer: Ksenia Kartvelishvili
 * Date: 30.08.2017
 * Copyright: 2009-2017 Comindware®
 *       All Rights Reserved
 * Published under the MIT license
 */

'use strict';

import { Handlebars } from 'lib';
import template from '../templates/button.hbs';
import BubbleItemView from './BubbleItemView';
import InputView from './InputView';
import FakeInputModel from '../models/FakeInputModel';

const classes = {
    CLASS_NAME: 'bubbles',
    DISABLED: ' disabled'
};

export default Marionette.CollectionView.extend({
    initialize(options) {
        this.reqres = options.reqres;
        this.collection = this.model.get('selected');
    },

    template: Handlebars.compile(template),

    className() {
        return classes.CLASS_NAME + (this.options.enabled ? '' : classes.DISABLED);
    },

    getChildView(model) {
        if (model instanceof FakeInputModel) {
            return InputView;
        }
        return BubbleItemView;
    },

    focus() {
        const fakeInputModel = this.__findFakeInputModel();
        if (!fakeInputModel) {
            return;
        }
        const input = this.children.findByModel(fakeInputModel);
        if (input && input.focus) {
            input.focus();
        }
    },

    updateInput() {
        const fakeInputModel = this.__findFakeInputModel();
        const input = this.children.findByModel(fakeInputModel);
        if (input) {
            input.updateInput();
        }
    },

    __findFakeInputModel() {
        return _.find(this.collection.models, model => (model instanceof FakeInputModel) && model);
    },

    events: {
        click: '__click'
    },

    tagName: 'ul',

    childViewOptions() {
        return {
            reqres: this.reqres,
            parent: this.$el,
            enabled: this.options.enabled,
            createValueUrl: this.options.createValueUrl,
            showEditButton: this.options.showEditButton,
            getDisplayText: this.options.getDisplayText
        };
    },

    __click() {
        this.reqres.request('button:click');
    },

    updateEnabled(enabled) {
        this.children.each(cv => {
            if (cv.updateEnabled) {
                cv.updateEnabled(enabled);
            }
        });
    }
});
