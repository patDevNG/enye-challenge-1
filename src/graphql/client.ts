
// import React from 'react';

// import { ApolloClient, InMemoryCache } from 'apollo-boost';
// // import { resolvers, typeDefs } from './resolvers';

// // 
// import { onError } from "apollo-link-error";
// import { ApolloLink } from "apollo-link";
// import { setContext } from "apollo-link-context";

// import { createUploadLink } from 'apollo-upload-client';
// import { notification } from 'antd';

// //
// // import { toast } from "react-toastify";

// // GraphQL cache
// const cache = new InMemoryCache();

// // ============links==================

// // const httpLink = new HttpLink({
// //     uri: 'https://sumaryz-api.appspot.com/graphql',
// //     credentials: "same-origin",
// // });

// const errorLink = onError(({ graphQLErrors, networkError, err }) => {
//     if (graphQLErrors) {
//         graphQLErrors.map(({ message }) =>
//             notification.error({
//                message: "Error" ,
//                description:message
//             })
//         );
//     }

//     if (networkError) {
//         notification.error({
//             message: "Error" ,
//             description:'Oops Network error'
//          }) 
//     }

// });


// const uploadLink = createUploadLink({ uri: 'http://localhost:4000/graphql' })

// const link = ApolloLink.from([errorLink,uploadLink]);


// //===========================================

// // GraphQL Client config
// const client = new ApolloClient({
//     cache,
//     link,
// });



// export default client;
// import { ApolloClient, HttpLink, InMemoryCache, from } from "@apollo/client";
import ApolloClient, { InMemoryCache } from "apollo-boost";
// import { persistCache } from "apollo-cache-persist";
// import { onError } from "@apollo/link-error";

// const cache = new InMemoryCache({});
// (async () =>
//   await persistCache({
//     cache: new InMemoryCache(),
//     storage: window.localStorage as any,
//   }))();

// const errorLink = onError(({ graphQLErrors, networkError }) => {
//   if (graphQLErrors)
//     graphQLErrors.map(({ message, locations, path }) =>
//       console.log(`[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`)
//     );

//   if (networkError) console.log(`[Network error]: ${networkError}`);
// });

// const link = from([errorLink, new HttpLink({ uri: "http://34.71.37.25:3000/graphql" })]);

// const client = new ApolloClient({
//   cache: new InMemoryCache(),
//   link,
// });

const client = new ApolloClient({
  uri: "https://us-central1-okuns-enye-challenge1.cloudfunctions.net/graphql/graphql",
  // uri: "https://mds-staging-266414.appspot.com/",
  // credentials: "include",
  // request: async (operation) => {
  // const token = await localStorage.getItem("x-auth");
  // operation.setContext({
  // headers: {
  // authorization: token ? `Bearer ${token}` : null
  // authorization: ``,
  // },
  // });
  // },
  cache: new InMemoryCache(),
  onError: ({ graphQLErrors, networkError }) => {
    if (graphQLErrors) {
      graphQLErrors.map(({ message }) => console.log(JSON.stringify(message)));
    }
    if (networkError) {
      console.log(networkError);
    }
  },
  clientState: {
    defaults: {
      isConnected: true,
    },
    resolvers: {
      Mutation: {
        updateNetworkStatus: (_, { isConnected }, { cache }) => {
          cache.writeData({ data: { isConnected } });
          return null;
        },
      },
    },
  },
});

export default client;