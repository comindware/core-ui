/*
const errorText = {
    noDataSource: Localizer.get('PROCESS.FORMDESIGNER.PROPERTIES.VALIDATION.ERRORTEXT.NODATASOURCE'),
    notUniqueDataSource: Localizer.get('PROCESS.FORMDESIGNER.PROPERTIES.VALIDATION.ERRORTEXT.REPEATDATASOURCE'),
    wrongNumberRange: Localizer.get('PROCESS.FORMDESIGNER.PROPERTIES.VALIDATION.ERRORTEXT.WRONGNUMBERRANGE'),
    notUniqueCollectionElements: Localizer.get('PROCESS.FORMDESIGNER.PROPERTIES.VALIDATION.ERRORTEXT.NOTUNIQUECOLLECTIONCOLUMNS'),
    emptyCollection: Localizer.get('PROCESS.FORMDESIGNER.PROPERTIES.VALIDATION.ERRORTEXT.EMPTYCOLLECTION')
};
*/
export default {
    validateCanvasComponents(formModel) {
        const validationErrors = [];
        formModel.eachComponent(componentModel => {
            if (componentModel.validate) {
                const validationError = componentModel.validate();
                if (validationError) {
                    validationErrors.push(validationError);
                    this.highlightInvalidComponent(componentModel);
                }
            }
        });

        return validationErrors;
    },

    highlightInvalidComponent(componentModel) {
        componentModel.set('invalid', true); //todo undo this!
    }
};
