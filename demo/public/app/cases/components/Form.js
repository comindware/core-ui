import CanvasView from 'demoPage/views/CanvasView';

export default function () {
    // 1. Create form template
    const template =
        '<div class="field-width" data-fields="name"></div>' +
        '<div class="field-width" data-fields="alias"></div>' +
        '<div class="field-width" data-fields="number"></div>' +
        '<div class="field-width" data-fields="dateTime"></div>' +
        '<div class="field-width" data-fields="duration"></div>' +
        '<div class="field-width" data-fields="dropdown"></div>' +
        '<div class="field-width" data-fields="wrongInstance"></div>' +
        '<div class="field-width" data-fields="dateTime2"></div>';

    // 2. Create form model
    const newClass = Backbone.Model.extend({
        initialize() {
            this.computedFields = new Backbone.ComputedFields(this);
        },

        computed: {
            alias: {
                depends: ['name', 'alias'],
                get(fields) {
                    if (fields.alias) {
                        return fields.alias;
                    }
                    return fields.name;
                }
            },
            name: {
                depends: ['name', 'alias'],
                get(fields) {
                    if (fields.name) {
                        return fields.name;
                    }
                    return this.previous('name');
                }
            }
        }
    });
    const model = new newClass({
        name: 'some name',
        alias: 'some alias',
        number: 451,
        dateTime: new Date(1984, 0, 24),
        duration: 'P14DT4H15M',
        dropdown: 'd.2',
        dateTime2: new Date()
    });

    // 3. Create view with BackboneFormBehavior and construct form scheme
    const View = Marionette.View.extend({
        initialize() {
            this.model = model;
        },

        onRender() {
            this.listenTo(this.model, 'change', () => console.log(this.model.changed));
        },

        template: Handlebars.compile(template),

        behaviors: {
            BackboneFormBehavior: {
                behaviorClass: core.form.behaviors.BackboneFormBehavior,
                schema() {
                    return {
                        name: {
                            title: 'Name',
                            type: 'Text',
                            helpText: 'Some help information',
                            autocommit: true
                        },
                        alias: {
                            title: 'Alias',
                            type: 'Text',
                            autocommit: true
                        },
                        number: {
                            type: 'Number',
                            title: 'Number',
                            helpText: 'Some help information',
                            autocommit: true
                        },
                        dateTime: {
                            type: 'DateTime',
                            title: 'DateTime',
                            dateDisplayFormat: 'LL',
                            timeDisplayFormat: 'LTS',
                            helpText: 'Some help information',
                            autocommit: true
                        },
                        duration: {
                            type: 'Duration',
                            title: 'Duration',
                            helpText: 'Some help information',
                            autocommit: true
                        },
                        dropdown: {
                            type: 'Datalist',
                            title: 'Dropdown',
                            collection: [
                                { id: 'd.1', text: 'Text 1' },
                                { id: 'd.2', text: 'Text 2' },
                                {
                                    id: 'd.3',
                                    text: 'Text 3'
                                },
                                { id: 'd.4', text: 'Text 4' }
                            ],
                            helpText: 'Some help information'
                        },
                        wrongInstance: {
                            type: 'Datalist',
                            title: 'Dropdown',
                            helpText: 'Some help information'
                        },
                        dateTime2: {
                            type: 'DateTime',
                            title: 'DateTime',
                            helpText: 'Some help information'
                        }
                    };
                }
            }
        }
    });

    // 4. Show created view
    return new CanvasView({
        view: new View()
    });
}
