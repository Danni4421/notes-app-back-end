const UploadsHandler = require('./handler');
const routes = require('./routes');

module.exports = {
  name: 'upload',
  version: '1.0.0',
  register: async (server, { service, validator }) => {
    const uploadsHandler = new UploadsHandler(service, validator);
    server.route(routes(uploadsHandler));
  },
};
