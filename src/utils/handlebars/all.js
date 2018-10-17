import equal from './equal';
import highlightFragment from './highlightFragment';
import localize from './localize';
import localizedText from './localizedText';
import renderFullDate from './renderFullDate';
import renderFullDateTime from './renderFullDateTime';

Handlebars.registerHelper('equal', equal);
Handlebars.registerHelper('highlightFragment', highlightFragment);
Handlebars.registerHelper('localize', localize);
Handlebars.registerHelper('localizedText', localizedText);
Handlebars.registerHelper('renderFullDate', renderFullDate);
Handlebars.registerHelper('renderFullDateTime', renderFullDateTime);
