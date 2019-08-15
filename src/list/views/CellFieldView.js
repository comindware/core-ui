import FieldView from '../../form/fields/FieldView';

export default class CellFieldViewClass extends FieldView {
    constructor(options) {
        options.showLabel = false;
        options.showHelpText = false;
        super(options);
    }
}
