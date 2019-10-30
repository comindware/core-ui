import MappingService from '../services/MappingService';
import constants from '../Constants';

export default {
    async getAutoCompleteObject(options = {}) {
        let completion = [];
        let currentArray = [];
        let autoCompleteObject = {};
        if (options.token.type === constants.tokenTypes.identifier || options.types[options.token.type]) {
            if (options.completeHoverQuery.SourceCode[options.token.start - 1] === constants.activeSymbol.$) {
                currentArray = options.autoCompleteModel.get('attributes');
            } else if (options.completeHoverQuery.SourceCode[options.token.start - 1] === constants.activeSymbol['>']) {
                currentArray = options.autoCompleteModel.get('templates');
            } else {
                currentArray = options.autoCompleteModel.get('functions');
            }
            completion = currentArray.filter(item => item.text.toLowerCase().indexOf(options.token.string.toLowerCase()) > -1);
            autoCompleteObject = {
                from: {
                    line: options.cursor.line,
                    ch: options.token.start
                },
                to: {
                    line: options.cursor.line,
                    ch: options.token.end
                },
                list: completion
            };
        } else if (options.token.string === constants.activeSymbol.$) {
            const result = await options.intelliAssist.getAttributes(options.currentId);
            const model = new Backbone.Model();
            model.set({ attributes: result });
            const arr = MappingService.mapOntologyModelToAutoCompleteArray(model);
            this.autoCompleteAttributes = arr;
            autoCompleteObject = {
                from: options.cursor,
                to: options.cursor,
                list: arr
            };
        } else if (options.token.string === constants.activeSymbol['->']) {
            const result = await options.intelliAssist.getTemplates(options.completeHoverQuery);
            const model = new Backbone.Model();
            model.set({ templates: result });
            const arr = MappingService.mapOntologyModelToAutoCompleteArray(model);
            autoCompleteObject = {
                from: options.cursor,
                to: options.cursor,
                list: arr
            };
        } else if (options.token.string === constants.activeSymbol['('] || options.codemirror.getValue().trim() === '') {
            autoCompleteObject = {
                from: options.cursor,
                to: options.cursor,
                list: options.autoCompleteModel.get('functions')
            };
        } else {
            autoCompleteObject = {
                from: options.cursor,
                to: options.cursor,
                list: completion
            };
        }
        return autoCompleteObject;
    }
};
