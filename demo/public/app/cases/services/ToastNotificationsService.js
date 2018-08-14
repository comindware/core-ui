import CanvasView from 'demoPage/views/CanvasView';

const showInfo = function () {
    const description = 'Confirm your action';

    core.ToastNotifications.add({
        text: description//,
        //title: 'Info'
    }, 'Info');
};

const showSuccess = function () {
    const description = `Лингвисты традиционно выделяют осмысленные фразы-панграммы, в которых все буквы алфавита встречаются ровно один раз[3]. Поскольку такие панграммы в некоторых языках очень трудно составить, обычно допускаются отклонения от этого идеала: повторения некоторых букв, использование сокращений, замена в соответствии с древнеримской традицией букв J и U на I и V. Без таких вольностей смысл идеальных панграмм в английском языке трудно понять, например, англ. Veldt jynx grimps waqf zho buck (26-буквенная панграмма из книги рекордов Гиннеса[6]) описывает маловероятную ситуацию, когда вертишейка из велда карабкается по быку-хайнаку, принадлежащему вакуфу (пуристы также указывают на другой недостаток этой фразы, кроме очевидных географических нестыковок: отсутствие необходимых артиклей[6]).

Составители другого типа панграмм стремятся минимизировать общее число слов, не пытаясь составить из этих слов фразу. В английском языке для этого требуется всего четыре слова — сильно помогает англ. Fjordhungkvisl (ручей в Исландии), кроме него, используются англ. Pecq (город Пек), англ. wamb (устаревшее правописание слова англ. womb, «матка») и эзотерическое слово англ. zyxt (форма глагола англ. see, последнее слово оксфордского словаря)[3]. Если ограничиться популярными словами из карманного словаря Уэбстера, то для английского языка задача оказывается неразрешимой: не удаётся собрать вместе слова с более чем 25 неповторяющимися буквами алфавита[3].

Росс Эклер также указывает на другие похожие задачи, например, нахождение слова с наибольшим числом неповторяющихся букв[3].`;

    core.ToastNotifications.add({
        text: description,
        title: 'Success'
    }, 'Success');
};

const showError = function () {
    const description = 'Error message';

    core.ToastNotifications.add({
        text: description,
        title: 'Error'
    }, 'Error');
};

const View = Marionette.View.extend({
    template: Handlebars.compile(`
        '<input class="js-confirm__button message-service__button" type="button" value="Show Info notification">'
        '<input class="js-yes-no__button message-service__button" type="button" value="Show Success notification">'
        '<input class="js-error__button message-service__button" type="button" value="Show Error notification">'
        `),
    ui: {
        showConfirm: '.js-confirm__button',
        showAskYesNo: '.js-yes-no__button',
        showError: '.js-error__button'
    },
    events: {
        'click @ui.showConfirm': showInfo,
        'click @ui.showAskYesNo': showSuccess,
        'click @ui.showError': showError
    }
});

export default function () {
    return new CanvasView({
        view: new View()
    });
}
