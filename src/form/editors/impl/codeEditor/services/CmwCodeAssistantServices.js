import MappingService from '../services/MappingService';
import constants from '../Constants';

export default {
    getAutoCompleteContext() {
        return this.autoCompleteContext;
    },

    findAutoCompleteContext(sourceCode, pos, autoCompleteModel) {
        const str = sourceCode.substr(pos - 3, 4);
        if (str === constants.activeSymbol.dbArrayRight) {
            this.autoCompleteContext = constants.autoCompleteContext.templates;
            return autoCompleteModel.get('templates');
        }
        this.autoCompleteContext = constants.autoCompleteContext.attributes;
        return autoCompleteModel.get('attributes');
    },

    async getDataRequest(options, type) {
        let result;
        const model = new Backbone.Model();
        if (type === constants.autoCompleteContext.attributes) {
            result = await options.intelliAssist.getAttributes(options.templateId);
            model.set({ attributes: result });
        }
        if (type === constants.autoCompleteContext.templates) {
            result = await options.intelliAssist.getTemplates(options.completeHoverQuery);
            model.set({ templates: result });
        }
        const arr = MappingService.mapOntologyModelToAutoCompleteArray(model).get(type);
        return arr;
    },

    async getAutoCompleteObject(options = {}) {
        let completion = [];
        let currentArray = [];
        let autoCompleteObject = {};
        if (options.token.type === constants.tokenTypes.identifier || options.types[options.token.type]) {
            if (options.completeHoverQuery.sourceCode[options.token.start - 1] === constants.activeSymbol.dollar) {
                currentArray = options.autoCompleteModel.get('attributes');
            } else if (options.completeHoverQuery.sourceCode[options.token.start - 1] === constants.activeSymbol.rightAngleBracket) {
                currentArray = this.findAutoCompleteContext(options.completeHoverQuery.sourceCode, options.token.start - 1, options.autoCompleteModel);
            } else {
                currentArray = options.autoCompleteModel.get('functions');
                this.autoCompleteContext = constants.autoCompleteContext.functions;
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
        } else if (options.token.string === constants.activeSymbol.dollar) {
            const result = await this.getDataRequest(options, constants.autoCompleteContext.attributes);
            options.autoCompleteModel.set({ attributes: result });
            this.autoCompleteContext = constants.autoCompleteContext.attributes;
            autoCompleteObject = {
                from: options.cursor,
                to: options.cursor,
                list: result
            };
        } else if (options.token.string === constants.activeSymbol.arrayRight) {
            const result = await this.getDataRequest(options, constants.autoCompleteContext.templates);
            options.autoCompleteModel.set({ templates: result });
            this.autoCompleteContext = constants.autoCompleteContext.templates;
            autoCompleteObject = {
                from: options.cursor,
                to: options.cursor,
                list: result
            };
        } else if (options.token.string === constants.activeSymbol.openParenthesis || options.codemirror.getValue().trim() === '') {
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
