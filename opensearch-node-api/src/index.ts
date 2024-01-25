import express from 'express';
import { Client } from '@opensearch-project/opensearch';

const app = express();
app.use(express.json());

const PORT = 3000;

const client = new Client({
  node: 'https://localhost:9200',
  auth: {
    username: 'admin', // Replace with your OpenSearch username
    password: 'admin'  // Replace with your OpenSearch password
  },
  ssl: {
    rejectUnauthorized: false // Only for development, use proper SSL config for production
  }
});

app.get('/', (req, res) => {
  res.send('Welcome to the OpenSearch API service!');
});

app.post('/index', async (req, res) => {
  const { index, document } = req.body;
  try {
    const response = await client.index({
      index: index || 'documents',
      body: document
    });
    await client.indices.refresh({ index: index || 'documents' });
    res.json(response);
  } catch (error) {
    console.error('Indexing error:', error);
    res.status(500).json({ error: 'Error in indexing document' });
  }
});

app.get('/search', async (req, res) => {
  const index = req.query.index as string || 'documents';
  const q = req.query.q;

  if (typeof q !== 'string') {
    return res.status(400).json({ error: "Query parameter 'q' must be a string" });
  }

  try {
    const response = await client.search({
      index: index,
      body: {
        query: {
          match: {
            content: q
          }
        }
      }
    });
    res.json(response.body.hits.hits);
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: 'Error in searching documents' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
