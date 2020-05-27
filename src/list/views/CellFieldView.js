import FieldView from '../../form/fields/FieldView';

export default class CellFieldViewClass extends FieldView {
    constructor(options) {
        options.showLabel = false;
        options.showHelpText = false;
        const { validators, ...rest } = options.schema;
        options.schema = {
            autocommit: true,
            isButtonLimitMode: true,
            maxButtonItems: 1,
            ...rest
        };
        super(options);
    }
}
