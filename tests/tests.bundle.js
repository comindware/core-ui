const context = require.context('./specs', true, /.+\.spec\.jsx?$/);
context.keys().forEach(context);
export default context;
