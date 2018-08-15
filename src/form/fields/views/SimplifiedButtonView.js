import template from '../templates/simplifiedButton.hbs';

export default Marionette.View.extend({
    template: Handlebars.compile(template),

    className: 'simplified-button_container',

    regions: {
        gridRegion: '.js-grid-region'
    },

    ui: {
        counterRegion: '.js-counter-region',
        counterRegionCounter: '.js-counter-region__counter'
    },

    onRender() {
        const columns = [
            {
                key: 'value',
                type: Core.meta.objectPropertyTypes.STRING,
                format: 'HTML',
                width: 35
            }
        ];

        this.options.model.on('change', () => this.__updateDisplayValue(this.options.editor.getValue()));
        const values = this.options.editor.getValue();

        const collectionValues = this.__formatValues(this.options.editor.schema, values);

        let showCounter = false;
        let counterValue = false;

        if (collectionValues.length > 2) {
            counterValue = `+${collectionValues.length - 1}`;
            collectionValues.splice(1, collectionValues.length - 1);
            showCounter = true;
        }

        this.collection = new Backbone.Collection(collectionValues);

        const grid = new Core.list.factory.createDefaultGrid({
            gridViewOptions: {
                columns,
                showHeader: false,
                class: 'simplified-button_grid',
                emptyView: null
            },
            isSliding: false,
            collection: this.collection
        });

        this.showChildView('gridRegion', grid);
        this.__updateCounter(showCounter, counterValue);
    },

    __formatValues(schema, values) {
        this.el.setAttribute('extended', true);

        switch (schema.type) {
            case 'Datalist': {
                return Array.isArray(values) ? values.map(v => ({
                    value: `
                <div class="user-edit-wrp" title="${v.name}">
                    <div class="simple-field_container">
                    ${v.avatarUrl ? `<img src="${v.avatarUrl}">` : this.__getAbbreviation(v.name).toUpperCase()}
                </div>
                 ${v.name}
            </div>`
                })) : [{ value: values.name }];
            }
            case 'Document': {
                return Array.isArray(values) ? values.map(v => ({
                    value: `
                <div class="user-edit-wrp" title="${v.name}">
                    <div class="simple-field_container">
                    ${v.avatarUrl ? `<img src="${v.avatarUrl}">` : this.__getAbbreviation(v.name).toUpperCase()}
                </div>
            </div>`
                })) : [{ value: values.name }];
            }
            default:
                return Array.isArray(values) ? values : [values];
        }
    },

    __getAbbreviation(fullName) {
        if (!fullName) {
            return '';
        }

        const words = fullName.split(/[, _]/);
        switch (words.length) {
            case 0:
                return '';
            case 1:
                return this._getWordAbbreviation(words[0], true);
            default:
                return this._getWordAbbreviation(words[0], words[1].length === 0) + this._getWordAbbreviation(words[1], words[0].length === 0);
        }
    },

    _getWordAbbreviation(word, takeTwo) {
        if (word.length === 0) {
            return '';
        }

        return word.substring(0, word.length > 1 && takeTwo ? 2 : 1);
    },

    __updateDisplayValue(values) {
        const collectionValues = this.__formatValues(this.options.editor.schema, values);

        let showCounter = false;
        let counterValue = false;

        if (collectionValues.length > 2) {
            counterValue = `+${collectionValues.length - 1}`;
            collectionValues.splice(1, collectionValues.length - 1);
            showCounter = true;
        }

        this.collection.reset(collectionValues);
        this.__updateCounter(showCounter, counterValue);
    },

    __updateCounter(showCounter, counterValue) {
        if (this.isRendered()) {
            if (showCounter) {
                this.ui.counterRegion.show();
                this.ui.counterRegionCounter.html(counterValue);
            } else {
                this.ui.counterRegion.hide();
            }
        }
    }
});
