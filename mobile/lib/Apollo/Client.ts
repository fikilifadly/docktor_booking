import {
  ApolloClient,
  InMemoryCache,
  createHttpLink
} from '@apollo/client'

import { setContext } from '@apollo/client/link/context'
import { secureStore } from '../../utils'

const httpLink = createHttpLink({
  // TO-DO ENV PATH target
  uri: 'https://TO-DO: ENV URL PATH',
})

const authLink = setContext(async (_, { headers }) => {
  const token = await secureStore.getAccessToken()

  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
    },
  }
})

export const apolloClient = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
})