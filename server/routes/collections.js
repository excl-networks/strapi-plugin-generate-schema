module.exports = {
  type: 'admin',
  routes: [
    {
      method: 'GET',
      path: '/collections',
      handler: 'collections.index',
      config: {
        policies: [],
        auth: false,
      },
    },
    // ...
  ],
};
