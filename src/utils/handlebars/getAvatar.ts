import UserService from 'services/UserService';

export default (context: any) => new Handlebars.SafeString(UserService.getAvatar(context?.data?.root));
