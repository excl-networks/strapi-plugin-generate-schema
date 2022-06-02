module.exports = async (ctx, next) => {
  // check if url
  // parse query string from ctx.request.url
  const queryString = ctx.request.url.split('?')[1]
  //check if there is a query string
  if (!queryString) {
    await next()
    return
  }
  // checking if method is GET
  if (ctx.request.method !== 'GET') {
    await next()
    return
  }
// parse query string into object
  const query = queryString.split('&').reduce((acc, item) => {
      const [key, value] = item.split('=')
      acc[key] = value
      return acc
    }
    , {})
  // if schemaOrg is false or undefined, skip schemaOrg middleware
  if (query.schemaOrg !== 'true' || query.schemaOrg === undefined) {
    await next()
    return
  }
  // if schemaOrg is true, run schemaOrg middleware
  // get schemaOrg data from strapi
  let collectionName = ctx.request.url.split('/')

  collectionName = collectionName[collectionName.length - 1]
  collectionName = collectionName.split('?')[0]
  const schemas = await strapi.entityService.findMany('plugin::generate-schema.schema', {
    filters: {
      collection: collectionName
    }
  });


  await next();
  //TODO: figure out if there is a more efficient way to do this

  // Loop through all of the schemas that are related to this collection
  for (const schema of schemas) {
    // Loop through all of the records that were returned from the database
    for (const row of ctx.body.data) {
      let schemaOrg = {
        "@context": "http://schema.org",
        "@type": schema.schemaType,
      }
      // Loop through all of the fields in the schema
      for (const schemaData of schema.data) {
        if(schemaData.type === 'nested'){
          schemaOrg[schemaData.key] = {}
        }
        if(schemaData.type === 'select'){
          if(schemaData.parent){
            schemaOrg[schemaData.parent][schemaData.key] = schemaData.value
          }else{
            schemaOrg[schemaData.key] = schemaData.value
          }
        }
        let currentRelation

        if(schemaData.value && schemaData.value.startsWith('generateSchemaRelation_')){
          let parsed = schemaData.value.split('generateSchemaRelation_')[1].split('_')
          currentRelation = parsed[0]
          schemaData.value = parsed[1]
        }
        // loop over all of the different row attributes
        Object.keys(row.attributes).map((fieldKey) => {

          if(currentRelation === fieldKey && currentRelation){
            Object.keys(row.attributes[fieldKey].data.attributes).map((fieldKey2) => {
              makeSchemaOrg(row.attributes[fieldKey].data.attributes, fieldKey2)
            })


          }else{
            makeSchemaOrg(row.attributes, fieldKey)
          }
          // if the fieldKey is the same as the schemaData.value (i.e what its mapped to), add the value to the schemaOrg object
        function makeSchemaOrg(attributes, fieldKey){
          if (fieldKey === schemaData.value) {
            // if schemaData.parent exists add the value to the parent
            if (schemaData.parent) {
              schemaOrg[schemaData.parent][schemaData.key] = attributes[fieldKey]
            }else if(schemaData.type === "image"){
              schemaOrg[schemaData.key] = attributes[fieldKey].data.attributes.url
            }else{
              schemaOrg[schemaData.key] = attributes[fieldKey]
            }
          }
        }

        })
      }
      // check if schemaOrg key exists in row
      if (!row.schemaOrg) {
        row['schemaOrg'] = []
      }
      row['schemaOrg'].push(schemaOrg)
    }

  }


};
