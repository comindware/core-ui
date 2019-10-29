import MappingService from '../services/MappingService';
export default {
    async getAutoCompleteObject(token, types, cursor, autoCompleteModel, completeHoverQuery, intelliAssist, codemirror, currentId) {
        const completion = [];
        let currentArray = [];
        let autoCompleteObject = {};
        if (token.type === 'identifier' || types[token.type]) {
            if (completeHoverQuery.SourceCode[token.start - 1] === '$') {
                currentArray = autoCompleteModel.get('attributes');
            } else if (completeHoverQuery.SourceCode[token.start - 1] === '>') {
                currentArray = autoCompleteModel.get('templates');
            } else {
                currentArray = autoCompleteModel.get('functions');
            }
            currentArray.forEach(item => {
                if (item.text.toLowerCase().indexOf(token.string.toLowerCase()) > -1) {
                    completion.push(item);
                }
            });
            autoCompleteObject = {
                from: {
                    line: cursor.line,
                    ch: token.start
                },
                to: {
                    line: cursor.line,
                    ch: token.end
                },
                list: completion
            };
        } else if (token.string === '$') {
            const result = await intelliAssist.getAttributes(currentId);
            const model = new Backbone.Model();
            model.set({ attributes: result });
            const arr = MappingService.mapOntologyModelToAutoCompleteArray(model);
            this.autoCompleteAttributes = arr;
            autoCompleteObject = {
                from: cursor,
                to: cursor,
                list: arr
            };
        } else if (token.string === '->') {
            const result = await intelliAssist.getTemplates(completeHoverQuery);
            const model = new Backbone.Model();
            model.set({ templates: result });
            const arr = MappingService.mapOntologyModelToAutoCompleteArray(model);
            autoCompleteObject = {
                from: cursor,
                to: cursor,
                list: arr
            };
        } else if (token.string === '(' || codemirror.getValue().trim() === '') {
            autoCompleteObject = {
                from: cursor,
                to: cursor,
                list: autoCompleteModel.get('functions')
            };
        } else {
            autoCompleteObject = {
                from: cursor,
                to: cursor,
                list: completion
            };
        }
        return autoCompleteObject;
    }
};
