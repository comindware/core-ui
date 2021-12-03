import CanvasView from 'demoPage/views/CanvasView';

export default function() {
    // 1. Create form template
    const template =
        '<div data-fields="tel"></div>' +
        '<div data-fields="passport"></div>' +
        '<div data-fields="index"></div>' +
        '<div data-fields="inn"></div>' +
        '<div data-fields="ogrn"></div>' +
        '<div data-fields="carnumber"></div>' +
        '<div data-fields="email"></div>';

    // 2. Create form model
    const model = new Backbone.Model({
        tel: undefined,
        passport: undefined,
        index: undefined,
        inn: undefined,
        ogrn: undefined,
        carnumber: undefined,
        email: undefined
    });

    // 3. Create view with BackboneFormBehavior and construct form scheme
    const View = Marionette.View.extend({
        className: 'layout__vertical-layout',

        template: Handlebars.compile(template),

        behaviors: {
            BackboneFormBehavior: {
                model,
                behaviorClass: Core.form.behaviors.BackboneFormBehavior,
                transliteratedFields: {
                    name: 'alias'
                }, // transliteratedFields becomes required-like, and overwrite next property in schema { changeMode: 'blur', autocommit: true, forceCommit: true}
                schema() {
                    return {
                        tel: {
                            title: 'tel',
                            type: 'Text',
                            helpText: 'Some help information',
                            autocommit: true,
                            format: 'PhoneRuMask',
                            allowEmptyValue: true //turn off required-like behavior for name
                        },
                        passport: {
                            title: 'passport',
                            type: 'Text',
                            helpText: 'Some help information',
                            autocommit: true,
                            format: 'PassportRuMask',
                            allowEmptyValue: true //turn off required-like behavior for name
                        },
                        index: {
                            title: 'index',
                            type: 'Text',
                            helpText: 'Some help information',
                            autocommit: true,
                            format: 'IndexRuMask',
                            allowEmptyValue: true //turn off required-like behavior for name
                        },
                        inn: {
                            title: 'inn',
                            type: 'Text',
                            helpText: 'Some help information',
                            autocommit: true,
                            format: 'INNMask',
                            allowEmptyValue: true //turn off required-like behavior for name
                        },
                        ogrn: {
                            title: 'ogrn',
                            type: 'Text',
                            helpText: 'Some help information',
                            autocommit: true,
                            format: 'OGRNMask',
                            allowEmptyValue: true //turn off required-like behavior for name
                        },
                        carnumber: {
                            title: 'carnumber',
                            type: 'Text',
                            helpText: 'Some help information',
                            autocommit: true,
                            format: 'LicensePlateNumberRuMask',
                            allowEmptyValue: true //turn off required-like behavior for name
                        },
                        email: {
                            title: 'email',
                            type: 'Text',
                            helpText: 'Some help information',
                            autocommit: true,
                            format: 'EmailMask',
                            allowEmptyValue: true //turn off required-like behavior for name
                        }
                    };
                }
            }
        }
    });

    // 4. Show created view
    return new CanvasView({
        view: new View({ model })
    });
}
