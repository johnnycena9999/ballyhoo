type Document = {
  title: string;
  date: string; // assuming date is a string in ISO format
  author: string;
  category: string;
};

type Query = {
  bool: BoolQuery;
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

function getProperty(doc: Document, key: string): string {
  const cleanKey = key.replace(/\.raw$/, '');
  return doc[cleanKey as keyof Document];
}

function matchesCondition(doc: Document, condition: Condition): boolean {
  if (condition.match) {
    return Object.entries(condition.match).every(([key, value]) => {
      return getProperty(doc, key).includes(value);
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

function filterDocuments(query: Query, docs: Document[]): Document[] {
  const { must = [], should = [] } = query.bool;

  return docs.filter(doc => {
    const mustMatch = must.every(condition => matchesCondition(doc, condition));
    const shouldMatch = should.length === 0 || should.some(condition => matchesCondition(doc, condition));
    
    return mustMatch && shouldMatch;
  });
}

const query: Query = {
  bool: {
    must: [
      {
        bool: {
          should: [
            { match: { "author.raw": "Alice" } },
            {
              bool: {
                must: [
                  { match: { "title.raw": "OpenSearch" } }
                ]
              }
            }
          ]
        }
      },
      { match: { "category.raw": "Technology" } }
    ]
  }
};

const filteredDocuments = filterDocuments(query, documents);

console.log(filteredDocuments);



// -----



function matchesCriteria(item, criteria) {
  if (typeof criteria === 'object' && criteria !== null) {
    if (criteria.and) {
      return Object.keys(criteria.and).every(key => matchesCriteria(item, { [key]: criteria.and[key] }));
    }
    if (criteria.or) {
      return Object.keys(criteria.or).some(key => matchesCriteria(item, { [key]: criteria.or[key] }));
    }
  } else {
    return Object.keys(criteria).every(key => item[key] === criteria[key]);
  }
  return false;
}

function filterItems(criteria, items) {
  return items.filter(item => matchesCriteria(item, criteria));
}

// Example usage
const criteria = {
  "and": {
    "name": "Alice",
    "or": {
      "color": "blue",
      "and": {
        "age": 30,
        "eye": "green"
      }
    }
  }
};

const items = [
  { name: "Alice", color: "blue", age: 25, eye: "green" },
  { name: "Alice", color: "red", age: 30, eye: "green" },
  { name: "Bob", color: "blue", age: 30, eye: "green" },
  { name: "Alice", color: "blue", age: 30, eye: "green" }
];

const filteredItems = filterItems(criteria, items);
console.log(filteredItems);
