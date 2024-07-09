type Document = {
  title: string;
  date: string; // assuming date is a string in ISO format
  author: string;
  category: string;
};

type OpenSearchQuery = {
  query: {
    bool: BoolQuery;
  };
};

type BoolQuery = {
  must?: Condition[];
  should?: Condition[];
};

type Condition = {
  match?: Record<string, string>;
  bool?: BoolQuery;
};

const documents: Document[] = [
  { title: "OpenSearch Introduction", date: "2023-03-15", author: "Alice", category: "Technology" },
  { title: "Advanced OpenSearch", date: "2022-05-10", author: "Bob", category: "Science" },
  { title: "OpenSearch Best Practices", date: "2023-07-20", author: "Alice", category: "Technology" },
  // other documents
];

function matchesCondition(doc: Document, condition: Condition): boolean {
  if (condition.match) {
    return Object.entries(condition.match).every(([key, value]) => {
      return doc[key as keyof Document].includes(value);
    });
  }
  
  if (condition.bool) {
    const { must = [], should = [] } = condition.bool;
    
    const mustMatch = must.every(subCondition => matchesCondition(doc, subCondition));
    const shouldMatch = should.length === 0 || should.some(subCondition => matchesCondition(doc, subCondition));
    
    return mustMatch && shouldMatch;
  }
  
  return false;
}

function filterDocuments(query: OpenSearchQuery, docs: Document[]): Document[] {
  const { must = [], should = [] } = query.query.bool;

  return docs.filter(doc => {
    const mustMatch = must.every(condition => matchesCondition(doc, condition));
    const shouldMatch = should.length === 0 || should.some(condition => matchesCondition(doc, condition));
    
    return mustMatch && shouldMatch;
  });
}

const filteredDocuments = filterDocuments({
  query: {
    bool: {
      must: [
        {
          bool: {
            should: [
              { match: { author: "Alice" } },
              {
                bool: {
                  must: [
                    { match: { title: "OpenSearch" } }
                  ]
                }
              }
            ]
          }
        },
        { match: { category: "Technology" } }
      ]
    }
  }
}, documents);

console.log(filteredDocuments);
