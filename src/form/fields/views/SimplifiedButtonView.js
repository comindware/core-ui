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
        this.options.model.on('change', () => this.__updateDisplayValue(this.options.editor.getValue()));
        const values = this.options.editor.getValue();

        const collectionValues = this.__formatValues(this.options.editor.schema, values);

        let showCounter = false;
        let counterValue = false;

        if (collectionValues.length > 1) {
            counterValue = `+${collectionValues.length - 1}`;
            collectionValues.splice(1, collectionValues.length - 1);
            showCounter = true;
        }

        this.collection = new Backbone.Collection(collectionValues);

        const grid = new Core.list.factory.createDefaultGrid({
            gridViewOptions: {
                columns: [
                    {
                        key: 'value',
                        type: Core.meta.objectPropertyTypes.STRING,
                        format: 'HTML',
                        width: 35
                    }
                ],
                showHeader: false,
                class: 'simplified-button_grid',
                emptyView: null
            },
            isSliding: false,
            collection: this.collection
        });

        this.showChildView('gridRegion', grid);
        this.__updateCounter(showCounter, counterValue);
        this.el.setAttribute('title', this.__getTitle());
    },

    __formatValues(schema, values) {
        this.el.setAttribute('extended', true);

        switch (schema.type) {
            case 'Datalist': {
                return Array.isArray(values)
                    ? _.compact(values).map(v => ({
                          value: `
                <div class="user-edit-wrp">
                    <div class="simple-field_container">
                    ${v.avatarUrl ? `<img src="${v.avatarUrl}">` : v.abbreviation}
                </div>
                 ${v.name}
            </div>`
                      }))
                    : [{ value: values?.name }];
            }
            case 'Document': {
                return Array.isArray(values)
                    ? _.compact(values).map(v => ({
                          value: `
                <div class="user-edit-wrp">
                    <div class="simple-field_container">
                    ${v.avatarUrl ? `<img src="${v.avatarUrl}">` : v.abbreviation}
                </div>
            </div>`
                      }))
                    : [{ value: values?.name }];
            }
            default:
                return Array.isArray(values) ? values : [values];
        }
    },

    __updateDisplayValue(values) {
        const collectionValues = this.__formatValues(this.options.editor.schema, values);

        let showCounter = false;
        let counterValue = false;

        if (collectionValues.length > 1) {
            counterValue = `+${collectionValues.length - 1}`;
            collectionValues.splice(1, collectionValues.length - 1);
            showCounter = true;
        }

        this.collection.reset(collectionValues);
        this.__updateCounter(showCounter, counterValue);
        this.el.setAttribute('title', this.__getTitle());
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
    },

    __getTitle() {
        const values = this.options.editor.getValue();

        if (Array.isArray(values)) {
            return _.compact(values)
                .map(v => v.name || v.id)
                .join(', ');
        }
        return values && (values.name || values.id);
    }
});
