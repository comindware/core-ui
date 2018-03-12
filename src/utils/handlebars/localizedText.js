import LocalizationService from '../../services/LocalizationService';

export default function(textModel) {
    return LocalizationService.resolveLocalizedText(textModel);
}
