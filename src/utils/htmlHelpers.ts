import UserService from 'services/UserService';

export default /** @lends module:core.utils.htmlHelpers */ {
    /**
     * Highlights fragments within a text with &lt;span mark='highlight'&gt;&lt;/span&gt;.
     * @param {String} rawText Text to highlight.
     * @param {String} fragment highlighted fragment.
     * @param {Boolean} [escape=true] If true, <code>Handlebars.Utils.escapeExpression</code> will be applied to
     * the <code>text</code> before highlighting.
     * @return {String} Highlighted text
     * */
    highlightText(rawText: string, fragment: any, escape = true) {
        if (!fragment || typeof fragment !== 'string') {
            return rawText;
        }
        let text = rawText;
        if (!text) {
            return '';
        }
        if (escape) {
            text = Handlebars.Utils.escapeExpression(text);
        }

        const lowerText = String(text).toLowerCase();
        let startIndex = 0;
        let index;
        let output = '';
        const fragmentLower = fragment.toLowerCase();
        while ((index = lowerText.indexOf(fragmentLower, startIndex)) !== -1) {
            const index2 = index + fragment.length;
            output += `${text.substring(startIndex, index)}<mark class='highlight'>${text.substring(index, index2)}</mark>`;
            startIndex = index2;
        }

        if (startIndex < text.length) {
            output += text.substring(startIndex);
        }

        return output;
    },

    /**
     * Highlights html fragments within a text with &lt;span class='highlight'&gt;&lt;/span&gt;.
     * @param {String} rawHTML Html to highlight.
     * @param {String} fragment highlighted fragment.
     * @return {String} Highlighted text
     * */
    highlightHtml(rawHTML: any, fragment: string) {
        if (!rawHTML) {
            return;
        }
        const stringHtml = String(rawHTML).trim();
        if (stringHtml.startsWith('<') && stringHtml.endsWith('>')) {
            return stringHtml
              .replace(/>[^>]*<\//g, str=> this.highlightText(str, fragment, false));
        }
        return this.highlightText(stringHtml, fragment, false);
    },


    /**
     * Highlights mentions within a text with &lt;a href='...'&gt;&lt;/a&gt;.
     * @param {String} rawText Text to highlight.
     * @param {Boolean} [escape=true] If true, <code>Handlebars.Utils.escapeExpression</code> will be applied to
     * the <code>text</code> before highlighting.
     * @return {String} Highlighted text
     * */
    highlightMentions(rawText, escape) {
        let text = rawText;
        if (!text) {
            return '';
        }
        if (escape || escape === undefined) {
            text = Handlebars.Utils.escapeExpression(text);
        }

        const membersByUserName = UserService.listUsers().reduce((memo, user) => {
            if (user.userName) {
                memo[user.userName] = user;
            }
            return memo;
        }, {});
        const regex = /(\s|^)@([a-z0-9_\.]+)/gi;

        return text.replace(regex, (fragment, whitespace, userName: string) => {
            const user = membersByUserName[userName];
            if (user) {
                return `${whitespace}<a href="${user.url}" title="${user.name}">@${user.userName}</a>`;
            }
            return fragment;
        });
    },

    /**
     * Highlights urls within a text with &lt;a href='...'&gt;&lt;/a&gt;.
     * @param {String} rawText Text to highlight.
     * @param {Boolean} [escape=true] If true, <code>Handlebars.Utils.escapeExpression</code> will be applied on to
     * the <code>text</code> before highlighting.
     * @return {String} Highlighted text
     * */
    highlightUrls(rawText, escape) {
        let text = rawText;
        if (!text) {
            return '';
        }
        if (escape || escape === undefined) {
            text = Handlebars.Utils.escapeExpression(text);
        }

        const regex = /(?:ht|f)tp(?:s?):\/\/[^\s]*/gi;
        return text.replace(regex, url => `<a href="${url}">${url}</a>`);
    },

    /**
     * Highlights urls within a text with &lt;a href='...'&gt;&lt;/a&gt;.
     * @param {String} htmlText HTML to escape all tags info.
     * @return {String} Escaped text
     * */
    getTextfromHTML(htmlText = '') {
        return String(htmlText)
            .replace(/<[^>]*>/g, '')
            .replace(/&quot;/g, '"')
            .replace(/&nbsp;/g, ' ');
    }
};
