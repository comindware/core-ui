import template from '../../templates/filterPanel/configPanelGroup.html';

const constants = {
    groupByClass: 'icon-group',
    subGroupByClass: 'icon-subgroup',
    groupByCollumnId: 'groupByCollumn',
    subGroupByCollumnId: 'subGroupByCollumn'
};

export default Marionette.View.extend({
    initialize() {
        if (this.model.get('columnModel')) {
            this.listenTo(this.model, 'change', () => this.render());
        }
    },

    template: Handlebars.compile(template),

    regions: {
        groupRadioRegion: '.js-button-group'
    },

    onRender() {
        const groupRadioButton = this.__createGroupByColumn();

        this.showChildView('groupRadioRegion', groupRadioButton);
        this.listenTo(groupRadioButton, 'change', item => this.trigger(item.value));
    },

    __createGroupByColumn() {
        const radioOptions = [
            {
                id: constants.groupByCollumnId,
                title: Localizer.get('PROCESS.DATASET.QUERYBUILDER.GROUPBY'),
                displayText: Localizer.get('PROCESS.DATASET.QUERYBUILDER.GROUPBY')
            }
        ];

        if (this.model.get('level') > 0 && this.model.get('columnModel').get('group').columnlevel !== 1) {
            radioOptions.push({
                id: constants.subGroupByCollumnId,
                title: Localizer.get('PROCESS.DATASET.QUERYBUILDER.SUBGROUPBY'),
                displayText: Localizer.get('PROCESS.DATASET.QUERYBUILDER.SUBGROUPBY')
            });
        }

        return new Core.form.editors.RadioGroupEditor({
            model: this.model.get('columnModel').get('group'),
            key: 'groupings',
            changeMode: 'keydown',
            autocommit: true,
            radioOptions
        });
    }
});
