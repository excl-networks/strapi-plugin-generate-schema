module.exports = {
  info: {
    tableName: 'schema',
    singularName: 'schema', // kebab-case mandatory
    pluralName: 'schemas', // kebab-case mandatory
    displayName: 'Schemas',
    description: 'List of schemas',
    kind: 'collectionType'
  },
  options: {
    draftAndPublish: false,
  },
  pluginOptions: {
    'content-manager': {
      visible: true
    },
    'content-type-builder': {
      visible: false
    }
  },
  attributes: {
    collection: {
      type: 'string',
      min: 1,
      max: 50,
      configurable: false
    },
    schemaType: {
      type: 'string',
      min: 1,
      max: 50,
      configurable: false
    },
    data: {
      type: 'json',
      configurable: false
    }
  }
};
