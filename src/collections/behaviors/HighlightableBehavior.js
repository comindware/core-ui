
/**
 * Конструктор Behavior никогда не вызывается явно. Описанные в объекте options свойства должны
 * быть переданы как свойства behavior (см. документацию Marionette).
 * @name HighlightableBehavior
 * @memberof module:core.collection.behaviors
 * @class Behavior требуется для подсветки текста в моделях коллекции. Стандартный сценарий использования:
 * текстовый поиск с подсветкой найденных фрагментах в элементах списка.
 * @constructor
 * */

const HighlightableBehavior = function() {
};

Object.assign(HighlightableBehavior.prototype, /** @lends module:core.collection.behaviors.HighlightableBehavior.prototype */ {
    /**
     * Подсветить заданный текст во всех моделях.
     * @param {String} text Текст, который необходимо подсветить.
     * */
    highlight(text) {
        this.parentCollection.each(record => {
            if (record.highlight) {
                record.highlight(text);
            }
        });
    },

    /**
     * Снять подсветку во всех моделях.
     * */
    unhighlight() {
        this.parentCollection.each(record => {
            if (record.unhighlight) {
                record.unhighlight();
            }
        });
    }
});

export default HighlightableBehavior;
