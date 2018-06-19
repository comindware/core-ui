import CanvasView from 'demoPage/views/CanvasView';

export default function () {
    // 1. Create form template
    const template =
        '<div class="field-width" data-fields="text"></div>' +
        '<div class="field-width" data-fields="name"></div>' +
        '<div class="field-width" data-fields="alias"></div>' +
        '<div class="field-width" data-fields="name2"></div>' +
        '<div class="field-width" data-fields="alias2"></div>' +
        '<div class="field-width" data-fields="name3"></div>' +
        '<div class="field-width" data-fields="alias3"></div>' +
        '<div class="field-width" data-fields="number"></div>' +
        '<div class="field-width" data-fields="dateTime"></div>' +
        '<div class="field-width" data-fields="duration"></div>' +
        '<div class="field-width" data-fields="dropdown"></div>' +
        '<div class="field-width" data-fields="wrongInstance"></div>' +
        '<div class="field-width" data-fields="dateTime2"></div>';

    // 2. Create form model
    const model = new Backbone.Model({
        name: 'some name',
        alias: 'some alias',
        name2: 'name2',
        alias2: 'alias2',
        number: 451,
        dateTime: new Date(1984, 0, 24),
        duration: 'P14DT4H15M',
        dropdown: 'd.2',
        dateTime2: new Date()
    });

    //3. Create function for sideEditorEffect
    const effect = function(options) {
        if (options.view.form.getValue(options.anotherEditor)) {
            return;
        }
        this.model.set(options.anotherEditor, this.getValue());
    };

    // 4. Create view with BackboneFormBehavior and construct form scheme
    const View = Marionette.View.extend({
        initialize() {
            this.model = model;
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
                            sideEditorEffect: [
                                effect,
                                {
                                    anotherEditor: 'alias',
                                    view: this
                                }
                            ],
                            autocommit: true
                        },
                        alias: {
                            title: 'Alias',
                            type: 'Text',
                            autocommit: true,
                            validators: ['required']
                        },
                        name2: {
                            title: 'Name2',
                            type: 'Text',
                            sideEditorEffect: [
                                'passToEmptyEditor',
                                {
                                    anotherEditor: 'alias2',
                                    view: this
                                }
                            ],
                            autocommit: true
                        },
                        alias2: {
                            title: 'Alias2',
                            type: 'Text',
                            autocommit: true,
                            validators: ['required']
                        },
                        name3: {
                            title: 'This Name will be transliterate to SystemName',
                            type: 'Text',
                            sideEditorEffect: [
                                'translitToSystemName',
                                {
                                    anotherEditor: 'alias3',
                                    view: this
                                }
                            ],
                            autocommit: true
                        },
                        alias3: {
                            title: 'SystemName',
                            type: 'Text',
                            autocommit: true,
                            validators: ['required']
                        },
                        number: {
                            type: 'Number',
                            title: 'Number',
                            helpText: 'Some help information'
                        },
                        dateTime: {
                            type: 'DateTime',
                            title: 'DateTime',
                            helpText: 'Some help information'
                        },
                        duration: {
                            type: 'Duration',
                            title: 'Duration',
                            helpText: 'Some help information'
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

    // 5. Show created view
    return new CanvasView({
        view: new View()
    });
}
