
import ApolloClient, { InMemoryCache } from "apollo-boost";
import { notification } from "antd";
const client = new ApolloClient({
  uri: "https://us-central1-okuns-enye-challenge1.cloudfunctions.net/graphql/graphql",
  cache: new InMemoryCache(),
  onError: ({ graphQLErrors, networkError }) => {
    if (graphQLErrors) {
      graphQLErrors.map(({ message }) => notification.error({message:'Error', description:message}));
    }
    if (networkError) {
      console.log(networkError);
      notification.error({message:"Error", description:networkError})
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