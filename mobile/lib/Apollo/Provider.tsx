import React, { ReactNode } from 'react';
import { ApolloProvider } from '@apollo/client/react/index.js';
import { apolloClient } from './Client';

interface AppApolloProviderProps {
  children: ReactNode;
}

const AppApolloProvider = ({ children }: AppApolloProviderProps) => {
  return (
    <ApolloProvider client={apolloClient}>
      {children}
    </ApolloProvider>
  );
};

export default AppApolloProvider;