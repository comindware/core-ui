import template from '../templates/simplefiedButton.hbs';

export default Marionette.View.extend({
    template: Handlebars.compile(template),

    className: 'simplefied-button_container',

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

        const values = this.options.editor.getValue();
        const collectionValues = this.__formatValues(this.options.editor.schema, values);

        let showCounter = false;
        let counterValue = false;

        if (collectionValues.length > 3) { //todo make dynamic
            counterValue = collectionValues.length;
            collectionValues.splice(2, collectionValues.length - 1);
            showCounter = true;
        }

        const collection = new Backbone.Collection(collectionValues);

        const grid = new Core.list.factory.createDefaultGrid({
            gridViewOptions: {
                columns,
                showHeader: false,
                class: 'simplefied-button_grid'
            },
            collection
        });

        this.showChildView('gridRegion', grid);
        if (showCounter) {
            this.ui.counterRegion.show();
            this.ui.counterRegionCounter.html(counterValue);
        }
    },

    __formatValues(schema, values) {
        switch (schema.type) {
            case 'Datalist': {
                return Array.isArray(values) ? values.map(v => ({ value: v.name })) : [{ value: values.name }];
            }
            default:
                return Array.isArray(values) ? values : [values];
        }
    }
});
