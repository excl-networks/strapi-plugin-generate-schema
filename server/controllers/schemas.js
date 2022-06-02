'use strict';

/**
 * A set of functions called "actions" for `schemas`
 */
const schemas = require('../schemas');

module.exports = {
  index: async (ctx, next) => {
    // return all schemas from ./schemas
    console.log(schemas)
    ctx.body = schemas;
  },
  map: async (ctx, next) => {
    console.log("data", ctx.request.body.data)
    try {
      await strapi.query('plugin::generate-schema.schema').create({
          data: {
            collection: ctx.request.body.collection,
            schemaType: ctx.request.body.schemaType,
            data: ctx.request.body.data,
          }
        }
      );
    } catch (e) {
      strapi.log.error(e)
      return ctx.internalServerError('A Whoopsie Happened')
    }
    ctx.send({
      message: 'The content was created!'
    }, 201);
  },
  find: async (ctx, next) => {
    console.log("params", ctx.request.params)
    try {
      const data = await strapi.entityService.findMany('plugin::generate-schema.schema',{
        filters:{
          collection: ctx.request.params.collection
        }
      });
      ctx.send(data);
    } catch (e) {
      strapi.log.error(e)
      return ctx.internalServerError('A Whoopsie Happened')
    }
  },
  delete: async (ctx, next) => {
    console.log("params", ctx.request.query)
    try {
      const data = await strapi.entityService.delete("plugin::generate-schema.schema", ctx.request.query.collectionId, {});
      ctx.send(data);
    } catch (e) {
      strapi.log.error(e)
      return ctx.internalServerError('A Whoopsie Happened')
    }
  }
};
