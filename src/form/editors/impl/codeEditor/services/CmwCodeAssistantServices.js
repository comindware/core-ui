import MappingService from '../services/MappingService';
import constants from '../Constants';

export default {
    getAutoCompleteContext() {
        let result;
        switch (this.autoCompleteContext) {
            case constants.autoCompleteContext.functions:
                result = constants.autoCompleteContext.functions;
                break;
            case constants.autoCompleteContext.attributes:
                result = constants.autoCompleteContext.attributes;
                break;
            case constants.autoCompleteContext.templates:
                result = constants.autoCompleteContext.templates;
                break;
            default: result = null;
        }

        return result;
    },

    findAutoCompleteContext(sourceCode, pos, autoCompleteModel) {
        const str = sourceCode.substr(pos - 3, 4);
        if (str === constants.activeSymbol.dbArrayRight) {
            this.autoCompleteContext = constants.autoCompleteContext.templates;
            return autoCompleteModel.get(constants.autoCompleteContext.templates);
        }
        this.autoCompleteContext = constants.autoCompleteContext.attributes;
        return autoCompleteModel.get(constants.autoCompleteContext.attributes);
    },

    async getDataRequest(options, type) {
        let result;
        if (type === constants.autoCompleteContext.attributes) {
            result = await options.intelliAssist.getAttributes(options.templateId);
        }
        if (type === constants.autoCompleteContext.templates) {
            result = await options.intelliAssist.getTemplates(options.completeHoverQuery);
        }
        const arr = MappingService.mapOntologyArrayToAutoCompleteArray(result, type);
        return arr;
    },

    async getAutoCompleteObject(options = {}) {
        let completion = [];
        let currentArray = [];
        let autoCompleteObject = {};
        if (options.token.type === constants.tokenTypes.identifier || options.types[options.token.type]) {
            if (options.completeHoverQuery.sourceCode[options.token.start - 1] === constants.activeSymbol.dollar) {
                currentArray = options.autoCompleteModel.get(constants.autoCompleteContext.attributes);
            } else if (options.completeHoverQuery.sourceCode[options.token.start - 1] === constants.activeSymbol.rightAngleBracket) {
                currentArray = this.findAutoCompleteContext(options.completeHoverQuery.sourceCode, options.token.start - 1, options.autoCompleteModel);
            } else {
                currentArray = options.autoCompleteModel.get(constants.autoCompleteContext.functions);
                this.autoCompleteContext = constants.autoCompleteContext.functions;
            }
            if (options.token.string === null) {
                return;
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
                list: options.autoCompleteModel.get(constants.autoCompleteContext.functions)
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
