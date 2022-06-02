'use strict';

module.exports = {
  index(ctx) {
    let models = []
    strapi.db.config.models.forEach(model => {
      console.log(model.collectionName)
      console.log(model.pluginOptions)
      if(!model.pluginOptions){
        return
      }
      if(model.kind !== 'collectionType'){
        return;
      }
      // Checks if the model is visible
      if( Object.keys(model.pluginOptions).length === 0 || model?.pluginOptions?.['content-manager']?.visible ) {
        models.push(model)
      }
    });
    // console.log(models)
    ctx.body = models
  },
};
