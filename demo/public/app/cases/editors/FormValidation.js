define(['comindware/core', 'demoPage/views/CanvasView'],
    function (core, CanvasView) {
        'use strict';
        return function () {
            // 1. Create view template (NOTE: in real world scenario it should be a separate static file)
            var template =
                '<div class="field-width" data-fields="boolean"></div>' +
                '<div class="field-width" data-fields="dropdown"></div>' +
                '<div class="field-width" data-fields="membersBubble"></div>' +
                '<div class="field-width" data-fields="memberSelect"></div>' +
                '<div class="field-width" data-fields="number"></div>' +
                '<div class="field-width" data-fields="radioGroup"></div>' +
                '<div class="field-width" data-fields="reference"></div>' +
                '<div class="field-width" data-fields="textArea"></div>' +
                '<div class="field-width" data-fields="text"></div>' +
                '<div class="field-width" data-fields="avatar"></div>' +
                '<div class="field-width" data-fields="date"></div>' +
                '<div class="field-width" data-fields="dateTime"></div>' +
                '<div class="field-width" data-fields="duration"></div>' +
                '<div class="field-width" data-fields="mention"></div>' +
                '<div class="field-width" data-fields="multiSelect"></div>' +
                '<div class="field-width" data-fields="password"></div>' +
                '<div class="field-width" data-fields="time"></div>';

            // 2. Create model
            var model = new Backbone.Model({
                boolean: true,
                dropdown: 'id.2',
                membersBubble: [],
                memberSelect: null,
                number: 42,
                radioGroup: 'id.2',
                reference: null,
                textArea: 'Multiline text...\n...Rocks!',
                text: 'What a beautiful text',
                avatar: null,
                date: '2015-07-20T00:00:00Z',
                dateTime: '2015-07-20T10:46:37Z',
                duration: 'P14DT4H15M',
                mention: 'Type @ to get suggestions...',
                multiSelect: [],
                password: '',
                time: '2015-07-20T10:46:37Z'
            });

            // 3. Define the form view and use BackboneFormBehavior to describe form schema
            var View = Marionette.ItemView.extend({
                initialize: function (options) {
                    this.model = model;
                },

                template: Handlebars.compile(template),

                behaviors: {
                    BackboneFormBehavior: {
                        behaviorClass: core.form.behaviors.BackboneFormBehavior,
                        schema: function () {
                            return {
                                boolean: {
                                    type: 'Boolean',
                                    title: 'Boolean',
                                    validators: [ 'required' ],
                                    required: true, // to display the asterisk left from title
                                    validateOnChange: true
                                },
                                dropdown: {
                                    type: 'Dropdown',
                                    title: 'Dropdown',
                                    validators: [ 'required' ],
                                    required: true, // to display the asterisk left from title
                                    validateOnChange: true,
                                    collection: [
                                        { id: 'id.1', text: 'Item 1' },
                                        { id: 'id.2', text: 'Item 2' }
                                    ]
                                },
                                membersBubble: {
                                    type: 'MembersBubble',
                                    title: 'MembersBubble',
                                    validators: [ 'required' ],
                                    required: true, // to display the asterisk left from title
                                    validateOnChange: true
                                },
                                memberSelect: {
                                    type: 'MemberSelect',
                                    title: 'MemberSelect',
                                    validators: [ 'required' ],
                                    required: true, // to display the asterisk left from title
                                    validateOnChange: true
                                },
                                number: {
                                    type: 'Number',
                                    title: 'Number',
                                    validators: [ 'required' ],
                                    required: true, // to display the asterisk left from title
                                    validateOnChange: true
                                },
                                radioGroup: {
                                    type: 'RadioGroup',
                                    title: 'RadioGroup',
                                    validators: [ 'required' ],
                                    required: true, // to display the asterisk left from title
                                    validateOnChange: true,
                                    radioOptions: [
                                        { id: 'id.1', displayText: 'Option 1' },
                                        { id: 'id.2', displayText: 'Option 2' }
                                    ]
                                },
                                reference: {
                                    type: 'Reference',
                                    title: 'Reference',
                                    validators: [ 'required' ],
                                    required: true, // to display the asterisk left from title
                                    validateOnChange: true,
                                    controller: new core.form.editors.reference.controllers.DemoReferenceEditorController()
                                },
                                textArea: {
                                    type: 'TextArea',
                                    title: 'TextArea',
                                    validators: [ 'required' ],
                                    required: true, // to display the asterisk left from title
                                    validateOnChange: true
                                },
                                text: {
                                    type: 'Text',
                                    title: 'Text',
                                    validators: [ 'required' ],
                                    required: true, // to display the asterisk left from title
                                    validateOnChange: true
                                },
                                avatar: {
                                    type: 'Avatar',
                                    title: 'Avatar',
                                    validators: [ 'required' ],
                                    required: true, // to display the asterisk left from title
                                    validateOnChange: true,
                                    fullName: 'Foo Bar',
                                    autoUpload: true,
                                    refreshPreviewAfterUpload: true,
                                    controller: new core.form.editors.avatar.controllers.DemoAvatarEditorController({
                                        defaultURL: '/resources/images/defaultAvatar.png'
                                    })
                                },
                                date: {
                                    type: 'Date',
                                    title: 'Date',
                                    validators: [ 'required' ],
                                    required: true, // to display the asterisk left from title
                                    validateOnChange: true
                                },
                                dateTime: {
                                    type: 'DateTime',
                                    title: 'DateTime',
                                    validators: [ 'required' ],
                                    required: true, // to display the asterisk left from title
                                    validateOnChange: true
                                },
                                duration: {
                                    type: 'Duration',
                                    title: 'Duration',
                                    validators: [ 'required' ],
                                    required: true, // to display the asterisk left from title
                                    validateOnChange: true
                                },
                                mention: {
                                    type: 'Mention',
                                    title: 'Mention',
                                    validators: [ 'required' ],
                                    required: true, // to display the asterisk left from title
                                    validateOnChange: true
                                },
                                multiSelect: {
                                    type: 'MultiSelect',
                                    title: 'MultiSelect',
                                    validators: [ 'required' ],
                                    required: true, // to display the asterisk left from title
                                    validateOnChange: true,
                                    collection: [
                                        { id: 'id.1', text: 'Item 1' },
                                        { id: 'id.2', text: 'Item 2' }
                                    ]
                                },
                                password: {
                                    type: 'Password',
                                    title: 'Password',
                                    validators: [ 'required' ],
                                    required: true, // to display the asterisk left from title
                                    validateOnChange: true
                                },
                                time: {
                                    type: 'Time',
                                    title: 'Time',
                                    validators: [ 'required' ],
                                    required: true, // to display the asterisk left from title
                                    validateOnChange: true
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
        };
    });
