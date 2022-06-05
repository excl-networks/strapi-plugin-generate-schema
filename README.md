### :warning: This plugin is still in beta and new version will cause breaking changes causing schemas to be remapped. Please report any bugs to the issues tab

# Strapi Generate Schema Plugin

_This plugin only supports Strapi v4_

A plugin to dynamically map your database to a Schema.org JSON-LD schema. When you access your collection row with a specific query parameter (`i.e ?schemaOrg=true`) it will add the json-ld for that data.



## Installation

`npm install strapi-plugin-generate-schema`

or

`yarn add strapi-plugin-generate-schema`

## Configuration

```
'generate-schema': {
enabled: true,
},
```

## Usage

After installing the plugin a "generate-schema" tab will appear on the left side of the admin panel.

Here you can see a list of your visible collection types and if you click "Map Type" you will be able to map certain fields to the corresponding schema fields.

After you have mapped your fields you can add the `?schemaOrg=true` query parameter to your collection row to generate the json-ld for that row.

For example if you have a blog collection type you can query `/blog?schemaOrg=true` and you will see the json-ld for that row.



## Issues

All general issues should be submitted through the [Github issue system](https://github.com/excl-networks/strapi-plugin-generate-schema/issues)

If you find a security issue please do not publicly post it instead send an email to support@exclnetworks.com with "Generate Schema Security Issue" as the subject

## Links

- [NPM Package](https://www.npmjs.com/package/strapi-plugin-generate-schema)
- [Github](https://github.com/excl-networks/strapi-plugin-generate-schema)
- [MIT License](LICENSE.md)

## Currently Implemented

- Mapping collection types to specific schemas (i.e mapping you blog collection type to an article schema type)
- Allow mapping of relational types (i.e mapping image urls, or relation categories)
- Only allow mapping of viewable collections
- Efficiently parse data objects and generate the schema without ANY additional db queries (this requires you to populate all fields in that are used in schema when requesting)
- Bind types of schema to strapiFieldTypes. i.e you can only map a string to a string and a URL to a file upload etc
- Delete previously mapped schemas
- map multiple schemas to a single collection type. I.e map a reciepe and a articlel schema to the same collection type
  - Schemas are stored in an array attached to each data object when returned from the API
- New schemaOrgs are dynamically generated based on a json file
- support nested types (i.e @type: author)

## TODO

- [ ] Somehow add support for dynamic zones however I highly doubt this is going to be feasible due to how dynamic they are.
- [ ] Edit existing mappings (currently can only delete and remake) not sure if I will implement this because if collection type schema changes then it will be a pita to deal with. maybe a more long term feature.
- [ ] Prevent duplicate mapping of schemas. i.e a blog collection can have 2 different mappings to the same schema]

## ⭐️Did you find this helpful?
If you found this plugin helpful give it a star?
