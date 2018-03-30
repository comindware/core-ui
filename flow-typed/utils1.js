/* eslint-disable */
declare module 'utils1' {
    declare type helper = {
        setUniqueTimeout(someUniqueId: string, callback: () => any, delay: number): () => any,

        nextTick(callback : () => any): string,

        comparatorFor(comparatorFn : () => any, propertyName: string): Object,

        createLocalizedText(defaultText: string): Object,

        format(text: string): string,

        getPluralForm(n: number, texts: string): string,

        enqueueOperation(operation : () => any, queueId: string) : () => any,

        applyBehavior(target: Object): Object,

        ensureOption(options: Object, optionName: string): boolean,

        ensureProperty(Object: Object, propertyName: string): boolean,

        getPropertyOrDefault(propertyPath: string, obj: Object): any,

        assertArgumentNotFalsy(argumentValue: any, argumentName: string): boolean,

        throwError(message: string, name: string): boolean,

        throwInvalidOperationError(message: string): boolean,

        throwFormatError(message: string): boolean,

        throwArgumentError(message: string): boolean,

        throwNotSupportedError(message: string): boolean,

        throwNotImplementedError(message: string): boolean,

        throwNotFoundError(message: string): boolean
    };

    declare type htmlH = {
        highlightText(rawText: string, fragment: boolean, escape: string): string,

        highlightMentions(rawText: string, escape: boolean): string,

        highlightUrls(rawText: string, escape: boolean): string,

        isElementInDom(el: Object): boolean
    }

    declare export var helpers: helper;
    declare export var htmlHelpers: htmlH;
    declare export var RegionBehavior: Marionette.Behavior;
}
