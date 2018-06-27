import LocalizationService from '../../services/LocalizationService';

export default function(textId) {
    return LocalizationService.get(textId);
}
