export default class OntologyService { //CodeAssistantService
    static initialize() {
        this.model = null;
    }

    static invalidate() {
        this.model = null;
    }

    static async getFunctions() {
        let result;
        try {
            if (!this.isLoading) {
                this.isLoading = true;
                result = await Ajax.Ontology.GetOntology();
                this.isLoading = false;
            }
        } finally {
            //
        }
        return result;
    }

    static async getTemplates(completeHoverQuery) {
        let result;
        try {
            if (!this.isLoading) {
                this.isLoading = true;
                const response = await Ajax.CodeAssistant.ProcessCompleteHover(completeHoverQuery);
                result = response.infoList;
                this.isLoading = false;
            }
        } finally {
            //
        }
        return result;
    }

    static async getAttributes(templateId) {
        let result;
        try {
            if (!this.isLoading) {
                this.isLoading = true;
                const url = `api/RecordTypeContextApi?recordTypeId=${templateId}`;
                const response = await Ajax.getResponse('GET', url);
                result = response.filter(item => item.obsolete !== true);
                this.isLoading = false;
            }
        } finally {
            //
        }

        return result;
    }

    static async getCSharpOntology(completeHoverQuery) {
        return await this.__loadSCharpOntology(completeHoverQuery);
    }

    static async __loadSCharpOntology(completeHoverQuery) {
        let result;
        try {
            if (!this.isLoading) {
                this.isLoading = true;
                result = await Ajax.CodeAssistant.ProcessCompleteHover(completeHoverQuery);
            }
            this.model = new Backbone.Model(result);
        } finally {
            //
        }
        return this.model;
    }

    static async getCompile(userCompileQuery) {
        return await this.__loadCompile(userCompileQuery);
    }

    static async __loadCompile(userCompileQuery) {
        let result;
        try {
            if (!this.isLoading) {
                this.isLoading = true;
                result = await Ajax.CodeAssistant.ProcessCompile(userCompileQuery);
            }
            this.model = new Backbone.Model(result);
            this.isLoading = false;
        } finally {
            //
        }
        return this.model;
    }

    static async getFormatCSharp(formatQuery) {
        return await this.__loadFormatCSharp(formatQuery);
    }

    static async __loadFormatCSharp(formatQuery) {
        let result;
        try {
            if (!this.isLoading) {
                this.isLoading = true;
                result = await Ajax.CodeAssistant.ProcessFormatRefactor(formatQuery);
            }
            this.model = new Backbone.Model(result);
            this.isLoading = false;
        } finally {
            //
        }
        return this.model;
    }
}
