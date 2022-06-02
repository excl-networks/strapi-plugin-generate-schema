// Blog posting schema

module.exports = [
  {
    key: "headline",
    type: "string",
  },
  {
    key: "alternativeHeadline",
    type: "string",
  },
  {
    key: "image",
    type: "url",
  },
  {
    key: "author",
    type: "nested",
    nestedSchema: [
      {
        key: "@type",
        type: "select",
        options: [
          "Person",
          "Organization"
        ]
      },
      {
        key: "name",
        type: "string",
      }
    ]
  }
]
