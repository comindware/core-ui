import UserService from 'services/UserService';

export default /** @lends module:core.utils.htmlHelpers */ {
    /**
     * Highlights fragments within a text with &lt;span class='highlight'&gt;&lt;/span&gt;.
     * @param {String} rawText Text to highlight.
     * @param {String} fragment highlighted fragment.
     * @param {Boolean} [escape=true] If true, <code>Handlebars.Utils.escapeExpression</code> will be applied to
     * the <code>text</code> before highlighting.
     * @return {String} Highlighted text
     * */
    highlightText(rawText: string, fragment: string, escape: boolean) {
        let text = rawText;
        if (!text) {
            return '';
        }
        if (escape || escape === undefined) {
            text = Handlebars.Utils.escapeExpression(text);
        }

        const lowerText = text.toLowerCase();
        let startIndex = 0;
        let index;
        let output = '';
        while ((index = lowerText.indexOf(fragment, startIndex)) !== -1) {
            const index2 = index + fragment.length;
            output += `${text.substring(startIndex, index)}<span class='highlight'>${text.substring(index, index2)}</span>`;
            startIndex = index2;
        }

        if (startIndex < text.length) {
            output += text.substring(startIndex);
        }

        return output;
    },

    /**
     * Highlights mentions within a text with &lt;a href='...'&gt;&lt;/a&gt;.
     * @param {String} rawText Text to highlight.
     * @param {Boolean} [escape=true] If true, <code>Handlebars.Utils.escapeExpression</code> will be applied to
     * the <code>text</code> before highlighting.
     * @return {String} Highlighted text
     * */
    highlightMentions(rawText: string, escape: boolean): string {
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

        return text.replace(regex, (fragment, whitespace, userName) => {
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
    highlightUrls(rawText: string, escape: boolean): string {
        let text = rawText;
        if (!text) {
            return '';
        }
        if (escape || escape === undefined) {
            text = Handlebars.Utils.escapeExpression(text);
        }

        const regex = /(?:ht|f)tp(?:s?):\/\/[^\s]*/gi;

        return text.replace(regex, (url: string) => `<a href="${url}">${url}</a>`);
    }
};
