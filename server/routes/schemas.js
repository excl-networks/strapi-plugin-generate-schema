module.exports = {
  type: 'admin',
  routes: [
    {
      method: 'GET',
      path: '/schemas',
      handler: 'schemas.index',
      config: {
        policies: [],
        auth: false,
      },
    },
    {
      method: 'POST',
      path: '/schemas',
      handler: 'schemas.map',
      config: {
        policies: [],
        auth: false,
      },
    },
    {
      method: 'GET',
      path: '/schemas/:collection',
      handler: 'schemas.find',
      config: {
        policies: [],
        auth: false,
      }
    },
    {
      method: 'DELETE',
      path: '/schemas',
      handler: 'schemas.delete',
      config: {
        policies: [],
        auth: false,
      }

    }
    // ...
  ],
};
