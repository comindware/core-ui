import ontology from './codeEditorData';

export default class OntologyService {
    static initialize() {
        this.model = null;
    }

    static invalidate() {
        this.model = null;
    }

    static async getOntology() {
        if (this.model) {
            return this.model;
        }
        return await this.__loadOntology();
    }

    static async __loadOntology() {
        if (!this.isLoading) {
            this.isLoading = true;
        }

        if (!this.model) {
            this.model = new Backbone.Model(ontology);
        }
        this.isLoading = false;

        return this.model;
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
