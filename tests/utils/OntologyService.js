export default class OntologyService { //CodeAssistantService
    static initialize() {
        this.model = null;
    }

    static invalidate() {
        this.model = null;
    }

    static async getAutoCompleteModel() {
        let model;
        if (this.model) {
            model = this.model;
        }
        const functions = await this.__getFunctions();
        model = new Backbone.Model(functions);
        return model;
    }

    static async __getFunctions() {
        if (!this.isLoading) {
            this.isLoading = true;
            this.promise = Ajax.Ontology.GetOntology();
        }
        const functions = await this.promise;
        this.isLoading = false;
        return functions;
    }

    static async getTemplates(completeHoverQuery) {
        this.isLoading = true;
        this.promise = Ajax.CodeAssistant.ProcessCompleteHover(completeHoverQuery);
        const result = await this.promise;
        const array = [];
        result.infoList.forEach(element => {
            array.push(element);
        });
        return array;
    }

    static async getAttributes(templateId) {
        this.isLoading = true;
        const url = `api/RecordTypeContextApi?recordTypeId=${templateId}`;
        this.promise = Ajax.getResponse('GET', url);
        const result = await this.promise;
        const array = [];
        result.forEach(element => {
            if (element.obsolete !== true) {
                array.push(element);
            }
        });
        this.isLoading = false;

        return array;
    }

    static async getCSharpOntology(completeHoverQuery) {
        return await this.__loadSCharpOntology(completeHoverQuery);
    }

    static async __loadSCharpOntology(completeHoverQuery) {
        if (!this.isLoading) {
            this.isLoading = true;
            this.promise = Ajax.CodeAssistant.ProcessCompleteHover(completeHoverQuery);
        }
        const result = await this.promise;
        this.model = new Backbone.Model(result);

        this.isLoading = false;

        return this.model;
    }

    static async getCompile(userCompileQuery) {
        return await this.__loadCompile(userCompileQuery);
    }

    static async __loadCompile(userCompileQuery) {
        if (!this.isLoading) {
            this.isLoading = true;
            this.promise = Ajax.CodeAssistant.ProcessCompile(userCompileQuery);
        }
        const result = await this.promise;
        this.model = new Backbone.Model(result);
        this.isLoading = false;

        return this.model;
    }

    static async getFormatCSharp(formatQuery) {
        return await this.__loadFormatCSharp(formatQuery);
    }

    static async __loadFormatCSharp(formatQuery) {
        if (!this.isLoading) {
            this.isLoading = true;
            this.promise = Ajax.CodeAssistant.ProcessFormatRefactor(formatQuery);
        }
        const result = await this.promise;
        this.model = new Backbone.Model(result);

        this.isLoading = false;

        return this.model;
    }
}
