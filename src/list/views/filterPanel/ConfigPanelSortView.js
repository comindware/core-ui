import { sortDirection } from '../../../Meta';
import template from '../../templates/configPanelSort.html';

export default Marionette.View.extend({
    initialize() {
        if (this.model.get('columnModel')) {
            this.listenTo(this.model, 'change', () => this.render());
        }
    },

    template: Handlebars.compile(template),

    regions: {
        sortDirectionRegion: '.js-sort-direction-region',
        changeNullPositionRegion: '.js-change-null-position-region'
    },

    triggers: {
        'js-apply-button': 'trigger:apply',
        'js-add-filter-button': 'trigger:add:filter'
    },

    onRender() {
        if (this.model.get('columnModel').has('sort')) {
            const nullOnTopCheckBox = this.__createNullOnTopCheckBox();
            const view = this.__createSortDirectionRadioGroup();

            this.showChildView('sortDirectionRegion', view);
            this.showChildView('changeNullPositionRegion', nullOnTopCheckBox);

            if (
                !this.model
                    .get('columnModel')
                    .get('sort')
                    .has('direction')
            ) {
                nullOnTopCheckBox.setEnabled(false);
            }
        }
    },

    __createSortDirectionRadioGroup() {
        return new Core.form.editors.RadioGroupEditor({
            model: this.model.get('columnModel').get('sort'),
            key: 'direction',
            changeMode: 'keydown',
            autocommit: true,
            radioOptions: [
                {
                    id: sortDirection.ascending,
                    title: Localizer.get('PROCESS.DATASET.SORTINGVALUES.ASCENDING'),
                    displayText: Localizer.get('PROCESS.DATASET.SORTINGVALUES.ASCENDING')
                },
                {
                    id: sortDirection.descending,
                    title: Localizer.get('PROCESS.DATASET.SORTINGVALUES.DESCENDING'),
                    displayText: Localizer.get('PROCESS.DATASET.SORTINGVALUES.DESCENDING')
                }
            ]
        });
    },

    __createNullOnTopCheckBox() {
        return new Core.form.editors.BooleanEditor({
            model: this.model.get('columnModel').get('sort'),
            key: 'nullValuesOnTop',
            changeMode: 'keydown',
            autocommit: true,
            title: Localizer.get('PROCESS.DATASET.SORTINGVALUES.NULLONTOP'),
            displayText: Localizer.get('PROCESS.DATASET.SORTINGVALUES.NULLONTOP')
        });
    }
});
