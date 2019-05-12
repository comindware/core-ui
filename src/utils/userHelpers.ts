export default {
    getAbbreviation(fullName) {
        if (!fullName) {
            return '';
        }

        const words = fullName.split(/[, _]/);
        switch (words.length) {
            case 0:
                return '';
            case 1:
                return this._getWordAbbreviation(words[0], true);
            default:
                return this._getWordAbbreviation(words[0], words[1].length === 0) + this._getWordAbbreviation(words[1], words[0].length === 0);
        }
    },

    _getWordAbbreviation(word, takeTwo) {
        if (word.length === 0) {
            return '';
        }

        return word.substring(0, word.length > 1 && takeTwo ? 2 : 1);
    }
};
