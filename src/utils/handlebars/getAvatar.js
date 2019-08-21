import UserService from 'services/UserService';

export default context => new Handlebars.SafeString(UserService.getAvatar(context?.data?.root));
