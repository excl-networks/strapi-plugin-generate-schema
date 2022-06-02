/*
 *
 * HomePage
 *
 */

import React, {memo, useState, useEffect} from 'react';
import {Select, Option} from '@strapi/design-system/Select';
import Earth from '@strapi/icons/Earth';
import Stack from '@strapi/icons/Stack';
// import PropTypes from 'prop-types';
import pluginId from '../../pluginId';
import {Box} from '@strapi/design-system/Box';
import {Flex} from '@strapi/design-system/Flex';
import {Typography} from '@strapi/design-system/Typography';
import {EmptyStateLayout} from '@strapi/design-system/EmptyStateLayout';
import {BaseHeaderLayout, ContentLayout} from '@strapi/design-system/Layout';
import {Table, Thead, Tbody, Tr, Td, Th} from '@strapi/design-system/Table';
import {ModalLayout, ModalBody, ModalHeader, ModalFooter} from '@strapi/design-system/ModalLayout';
import {Button} from '@strapi/design-system/Button';
import collectionRequests from "../../api/collections";
import schemasRequest from "../../api/schemas";
import {GridLayout} from '@strapi/design-system/Layout';

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
    console.log("data", data)
    data[index]["value"] = event
    setParsedSchemaFields(data)
  }
  useEffect(() => {
    if (!schemas?.[selectedSchema]?.schema) return

    let data = parseSchemaFields(schemas[selectedSchema].schema)
    data.map((field) => {
      field["selectOptions"] = parseOptions(field)
    })
    console.log("schemaFieldsData", data)
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
    console.log(data)
    return data;
  }
  useEffect(() => {
    collectionRequests.getCollections().then(res => {
      console.log("collections", res)
      console.log(typeof res.data)
      setCollections(res.data);
    });
  }, [setCollections]);
  useEffect(() => {
    schemasRequest.getSchemas().then(res => {
      console.log(res)
      console.log(typeof res.data)
      setSchemas(res.data);
    });
  }, [setSchemas]);
  const submitMappedSchema = () => {
    console.log("parsedSchemaFields", parsedSchemaFields)
    let data = parsedSchemaFields.map((field) => {
      return {
        key: field.key,
        type: field.type,
        value: field.value,
        parent: field.parent,

      }
    })
    console.log("data", data)
    schemasRequest.mapSchema({
      collection: selectedCollection,
      schemaType: schemas[selectedSchema].name,
      data: data
    }).then(res => {
      console.log(res)
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
      console.log(res)
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
    console.log(field)
    if (field.type === "select") {
      return field.options.map((option, j) =>
        <Option key={j} value={option}>{option}</Option>
      )
    }
    return field.selectOptions.map((item, i) => {
      console.log("here")
      if(item.type=== "nested"){
        console.log("item", item)
        return item.children.map((child, j) => {
          console.log("child", child)
          return <Option key={j} value={child.value}>{item.label + ": " + child.label}</Option>
        })
      }
      return <Option key={i} value={item.value}>{item.label}</Option>
    })
  }
  const parseOptions = () => {
    let parsedCollections = collections
    let parsedAttributes = parsedCollections[selectedCollectionIndex].attributes
  // Adding all of the relational fields to the attributes
    Object.keys(parsedAttributes).map((key) => {
      if (parsedAttributes[key].type === "relation") {
        collections.forEach(collection => {
          if (collection.uid === parsedAttributes[key].target) {
            console.log("collection", collection)
            parsedAttributes[collection.collectionName + "_schemaRelation"] = {}
            Object.keys(collection.attributes).map(key => {
              console.log("collectionName" , collection.collectionName)
              parsedAttributes[collection.collectionName + "_schemaRelation"][key] = collection.attributes[key]
            })
            console.log("parse Options collection", collection)
            parsedAttributes[collection.collectionName + "_schemaRelation"]["relation"] = collection.apiName

          }
        })
      }
    });
    console.log("parsedCollections", parsedCollections)
    console.log("parsedAttributes", parsedAttributes)
    let options = []
    Object.keys(parsedAttributes).map((key, i) => {
      if(key.endsWith("_schemaRelation")) {
        options.push({
          label: key.replace("_schemaRelation", ""),
          type: "nested",
          children: []
        })
        Object.keys(parsedAttributes[key]).map(relation_key => {
          console.log("parsedAttributes", parsedAttributes)
          console.log("relation_key", relation_key)
          if(parsedAttributes[key][relation_key].type === "relation" || relation_key.endsWith("_schemaRelation")) {
            return;
          }
          console.log("parsedAttributes[key].relation", parsedAttributes[key].relation)
          options[i].children.push({
            label: relation_key,
            value: "generateSchemaRelation_" + parsedAttributes[key].relation + "_" + relation_key
          })
        })
      }else{
        options.push({
          label: key,
          value: key
        })
      }
    })
    console.log("options", options)
    return options
  }
  return (
    <>
      {isCreateModalVisible && <ModalLayout onClose={() => {
        closeModal();
        console.log("closing modal")
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
