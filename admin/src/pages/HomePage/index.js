/*
 *
 * HomePage
 *
 */

import React, {memo, useEffect, useState} from 'react';
import {Option, Select} from '@strapi/design-system/Select';
import Earth from '@strapi/icons/Earth';
import Stack from '@strapi/icons/Stack';
// import PropTypes from 'prop-types';
import {Box} from '@strapi/design-system/Box';
import {Typography} from '@strapi/design-system/Typography';
import {EmptyStateLayout} from '@strapi/design-system/EmptyStateLayout';
import {BaseHeaderLayout, ContentLayout} from '@strapi/design-system/Layout';
import {Table, Tbody, Td, Th, Thead, Tr} from '@strapi/design-system/Table';
import {ModalBody, ModalFooter, ModalHeader, ModalLayout} from '@strapi/design-system/ModalLayout';
import {Button} from '@strapi/design-system/Button';
import collectionRequests from "../../api/collections";
import schemasRequest from "../../api/schemas";

const HomePage = () => {
  // List of all of the valid collections
  const [collections, setCollections] = useState([]);
  // THe name of the currently selected collection (I.e clicking the "map types" button)
  const [selectedCollection, setSelectedCollection] = useState();
  // The index for the currently selected collection
  const [selectedCollectionIndex, setSelectedCollectionIndex] = useState();
  // list of all the schema.org schemas
  const [schemas, setSchemas] = useState([]);
  // list of all the prev mapped schemas with values
  const [mappedSchemas, setMappedSchemas] = useState([]);
  // the current selected schema within the modal
  const [selectedSchema, setSelectedSchema] = useState();
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  // extra formatting for each of the schema fields
  const [parsedSchemaFields, setParsedSchemaFields] = useState([]);

  const handleSchemaFormChange = (index, event) => {
    let data = [...parsedSchemaFields]
    data[index]["value"] = event
    setParsedSchemaFields(data)
  }
  useEffect(() => {
    if (!schemas?.[selectedSchema]?.schema) return

    let data = parseSchemaFields(schemas[selectedSchema].schema)
    data.map((field) => {
      field["selectOptions"] = parseOptions(field)
    })
    setParsedSchemaFields(data)
  }, [selectedSchema])
  const parseSchemaFields = (schemaOptions, parent = null) => {
    let data = []
    schemaOptions.map((schema, index) => {
      switch (schema.type) {
        case "select":
          data.push({
            key: schema.key,
            type: schema.type,
            options: schema.options
          })
          break;
        case "nested":
          // combine nestedSchema with schemaOptions
          data.push({
            key: schema.key,
            type: schema.type,
          })
          data = [...data, ...parseSchemaFields(schema.nestedSchema, schema.key)]
          break;
        default:
          data.push({
            key: schema.key,
            type: schema.type,
          })

      }
      if (parent) {
        data[data.length - 1]["parent"] = parent
      }
    });
    return data;
  }
  useEffect(() => {
    collectionRequests.getCollections().then(res => {
      setCollections(res.data);
    });
  }, [setCollections]);
  useEffect(() => {
    schemasRequest.getSchemas().then(res => {
      setSchemas(res.data);
    });
  }, [setSchemas]);
  const submitMappedSchema = () => {
    let data = parsedSchemaFields.map((field) => {
      return {
        key: field.key,
        type: field.type,
        value: field.value,
        parent: field.parent,

      }
    })
    schemasRequest.mapSchema({
      collection: selectedCollection,
      schemaType: schemas[selectedSchema].name,
      data: data
    }).then(res => {
      setIsCreateModalVisible(false)
    });
  }
  const findMappedSchemas = (collection) => {
    schemasRequest.findMappedSchemas(collection).then(res => {
      setMappedSchemas(res.data)
    });
  }
  const deleteSchema = () => {
    schemasRequest.deleteSchema(selectedSchema).then(res => {
      setIsDeleteModalVisible(false)
    });
  }
  const closeModal = () => {
    setIsCreateModalVisible(false)
    setIsDeleteModalVisible(false)
    setSelectedCollection([])
    // Delete all of the values set
    for (const schema of schemas) {
      schema.schema.map(item => {
        item.value = ""
      })
    }
    setSelectedSchema(undefined)
  }
  const fieldOptions = (field) => {
    let options = []
    if (field.type === "select") {
      field.options.forEach((option, j) =>
        options.push(<Option key={j} value={option}>{option}</Option>)
      )
      return options;
    }
    field.selectOptions.forEach((item, i) => {
      if (item.type === "nested") {
        let childArray = []
        item.children.forEach((child, j) => {
          if (renderOption(child.strapiFieldType, field.type)) {
            childArray.push(<Option key={j + item.label} value={child.value}>{item.label + ": " + child.label}</Option>)
          }
        })
        options = [...options, ...childArray]
      } else {
        if (renderOption(item.strapiFieldType, field.type)) {
          options.push(<Option key={i} value={item.value}>{item.label}</Option>)
        }

      }

    })
    return options;
  }
  const renderOption = (strapiFieldType, optionFieldType) => {
    let fieldTypeMap = {
      string: ["string", "datetime", "richtext", "number"],
      url: ["string", "richtext", 'fileupload'],
    }
    let keys = Object.keys(fieldTypeMap)
    for (let key of keys) {
      if (optionFieldType === key && fieldTypeMap[key].includes(strapiFieldType)) {
        return true
      }
    }
    return false

  }
  const parseOptions = () => {
    let parsedAttributes = collections[selectedCollectionIndex].attributes
    // Adding all of the relational fields to the attributes
    Object.keys(parsedAttributes).map((key) => {
      if (parsedAttributes[key].type === "relation") {
        collections.forEach(collection => {
          if (collection.uid === parsedAttributes[key].target) {
            parsedAttributes[collection.collectionName + "_schemaRelation"] = {}
            Object.keys(collection.attributes).map(key => {
              parsedAttributes[collection.collectionName + "_schemaRelation"][key] = collection.attributes[key]
            })
            parsedAttributes[collection.collectionName + "_schemaRelation"]["relation"] = collection.apiName

          }
        })
      }
    });
    let options = []
    Object.keys(parsedAttributes).map((key, i) => {
      console.log("parsedAttributes[key]", parsedAttributes[key])
      console.log("key", key)
      if (key.endsWith("_schemaRelation")) {
        options.push({
          label: key.replace("_schemaRelation", ""),
          type: "nested",
          children: []
        })
        Object.keys(parsedAttributes[key]).map(relation_key => {
          if (parsedAttributes[key][relation_key].type === "relation" || relation_key.endsWith("_schemaRelation")) {
            return;
          }
          options[i].children.push({
            strapiFieldType: parsedAttributes[key][relation_key].target === "plugin::upload.file" ? "fileupload" : parsedAttributes[key][relation_key].type,
            label: relation_key,
            value: "generateSchemaRelation_" + parsedAttributes[key].relation + "_" + relation_key
          })
        })
      } else {
        options.push({
          strapiFieldType: parsedAttributes[key].target === "plugin::upload.file" ? "fileupload" : parsedAttributes[key].type,
          label: key,
          value: key
        })
      }
    })
    return options
  }
  return (
    <>
      {isCreateModalVisible && <ModalLayout onClose={() => {
        closeModal();
      }
      } labelledBy="title">
        <ModalHeader>
          <Typography fontWeight="bold" textColor="neutral800" as="h2" id="title">
            Map {selectedCollection}
          </Typography>
        </ModalHeader>
        <ModalBody>
          <Select id="select1" label="Choose your schema type" labelAction={<Earth/>} required
                  placeholder="Select Schema Type" onClear={() => setSelectedSchema(undefined)}
                  value={selectedSchema} onChange={setSelectedSchema}
          >
            {schemas.map((schema, i) =>
              <Option key={schema.name} value={i}>{schema.name}</Option>
            )}
          </Select>
          {!isNaN(selectedSchema) &&
          parsedSchemaFields.map((field, i) =>
            <Box key={i} paddingTop={2}>
              {field.type === "nested" &&
              <Typography fontWeight="bold" textColor="neutral800" as="h2" id="title"> {
                // UC first letter
                field.key.charAt(0).toUpperCase() + field.key.slice(1)
              }</Typography>
              }
              {field.type !== "nested" &&
              <Select
                label={field.key}
                value={parsedSchemaFields[i].value}
                onChange={event => handleSchemaFormChange(i, event)}
                placeholder="Select Field">
                {fieldOptions(field)}
              </Select>
              }


            </Box>
          )}
        </ModalBody>
        <ModalFooter startActions={<Button onClick={() => setIsCreateModalVisible(prev => !prev)} variant="tertiary">
          Cancel
        </Button>} endActions={<>
          <Button onClick={() => {
            submitMappedSchema()
            closeModal()
          }}>Finish</Button>
        </>}/>
      </ModalLayout>}

      {isDeleteModalVisible && <ModalLayout onClose={() => {
        closeModal();
      }
      } labelledBy="title">
        <ModalHeader>
          <Typography fontWeight="bold" textColor="neutral800" as="h2" id="title">
            Delete {selectedCollection}
          </Typography>
        </ModalHeader>
        <ModalBody>
          {mappedSchemas.length === 0 &&

          <EmptyStateLayout icon={<Stack/>} content="You don't have any content yet..."/>
          }
          {mappedSchemas.length > 0 &&
          <Select label="Choose your schema type" labelAction={<Earth/>} required
                  placeholder="Select Schema Type" onClear={() => setSelectedSchema(undefined)}
                  value={selectedSchema} onChange={setSelectedSchema}
          >
            {mappedSchemas.map((schema, i) =>
              <Option key={schema.id} value={schema.id}>{schema.schemaType}</Option>
            )}
          </Select>
          }
        </ModalBody>
        <ModalFooter startActions={<Button onClick={() => setIsCreateModalVisible(prev => !prev)} variant="tertiary">
          Cancel
        </Button>} endActions={<>
          <Button variant='danger' onClick={() => {
            deleteSchema()
            closeModal()
          }}>Delete</Button>
        </>}/>
      </ModalLayout>}

      <BaseHeaderLayout
        title="Generate Schema"
        subtitle="Automatically add schema.org to your api requests with a query parameter."
        as="h2"
      />
      <ContentLayout>
        <Box padding={8} background="neutral100">
          <Table colCount={2} rowCount={collections.length + 1}>
            <Thead>
              <Tr>
                <Th>
                  <Typography variant="sigma">Collection Name</Typography>
                </Th>
                <Th>
                  <Typography variant="sigma">Map</Typography>
                </Th>
                <Th>
                  <Typography variant="sigma">Delete</Typography>
                </Th>

              </Tr>
            </Thead>
            <Tbody>
              {collections.map((collection, i) =>
                <Tr key={collection.collectionName}>
                  <Td>
                    <Typography textColor="neutral800">{collection.collectionName}</Typography>
                  </Td>
                  <Td>

                    <Button onClick={() => {
                      setIsCreateModalVisible(prev => !prev)
                      setSelectedCollection(collection.collectionName)
                      setSelectedCollectionIndex(i)
                    }
                    }>Map Type</Button>


                  </Td>
                  <Td>
                    <Button variant="danger" onClick={() => {
                      setIsDeleteModalVisible(true)
                      setSelectedCollection(collection.collectionName)
                      setSelectedCollectionIndex(i)
                      findMappedSchemas(collection.collectionName)
                    }
                    }>Delete Type</Button>
                  </Td>
                </Tr>)}
            </Tbody>
          </Table>
        </Box>;

      </ContentLayout>
    </>
  );
};

export default memo(HomePage);
