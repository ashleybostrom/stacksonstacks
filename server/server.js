const express = require('express');
const path = require('path');
const db = require('./config/connection');

// import ApolloServer
const { ApolloServer } = require('@apollo/server');
// import our typeDefs and resolvers
const { typeDefs, resolvers } = require('./schemas');
const { request } = require('http');
// import middleware function
const { authMiddleware, signToken } = require('./utils/auth');

const loggingPlugin = {
  // Fires whenever a GraphQL request is received from a client.
  async requestDidStart(requestContext) {
    console.info('Request started! Query:\n' + requestContext.request.query);

    return {
      // Fires whenever Apollo Server will parse a GraphQL
      async parsingDidStart(requestContext) {
        console.info('Parsing started!');
        console.info(
          requestContext.request.operationName,
          requestContext.request.variables
        );
        return async (err) => {
          if (err) {
            console.error('Parsing failed!');
          } 
        };
      },

      // Fires whenever Apollo Server will validatea a GraphQL operation's variables.
      async validationDidStart(requestContext) {
        console.info('Validation started!');
        return async (errs) => {
          if (errs) {
            errs.forEach((err) => console.error(err));
          }
        }
      },
      // Fire whenever Apollo Server encounters errors while executing a GraphQL operation.
      async didEncounterErrors(requestContext) {
        console.error('Encountered errors!');
        console.error(requestContext.errors);
      },
    };
  },
};

const PORT = process.env.PORT || 3001;
// New Apollo server and pass in schema data
const server = new ApolloServer({
  typeDefs,
  resolvers,
  // context: authMiddleware,
  // plugins: [loggingPlugin],
});
// integrate our Apollo server with the Express application as middleware
const app = express();

// if we're in production, serve client/build as static assets
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
} else {
  app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build/index.html'));
  });
}

// Start Apollo Server
const startApolloServer = async (typeDefs, resolvers) => {
  await server.start();

app.use(
  express.urlencoded({ extended: true }),
  express.json(),
  expressMiddleware(server, {
    context: authMiddleware
  })
);

db.once('open', () => {
  app.listen(PORT, () => { console.log(`🌍 Now listening on localhost:${PORT}`);
  });
});
};

startApolloServer(typeDefs, resolvers);

