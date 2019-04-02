import equal from './equal';
import highlightFragment from './highlightFragment';
import localize from './localize';
import localizedText from './localizedText';
import renderAsHtml from './renderAsHtml';
import renderDate from './renderDate';
import renderFullDate from './renderFullDate';
import renderFullDateTime from './renderFullDateTime';
import renderShortDuration from './renderShortDuration';

Handlebars.registerHelper('equal', equal);
Handlebars.registerHelper('highlightFragment', highlightFragment);
Handlebars.registerHelper('localize', localize);
Handlebars.registerHelper('localizedText', localizedText);
Handlebars.registerHelper('renderAsHtml', renderAsHtml);
Handlebars.registerHelper('renderDate', renderDate);
Handlebars.registerHelper('renderFullDate', renderFullDate);
Handlebars.registerHelper('renderFullDateTime', renderFullDateTime);
Handlebars.registerHelper('renderShortDuration', renderShortDuration);
