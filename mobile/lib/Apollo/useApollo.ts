import { useMemo } from 'react'

/**
 * 1. DIRECT HOOK RESOLUTION
 * In React Native, importing from '@apollo/client' often fails to find hooks.
 * We go directly to the React index to force the bundler to find the members.
 */
import { useQuery, useMutation } from '@apollo/client/react/index.js'

/**
 * 2. CORE TYPES
 * We pull the types from the same package but ensure we use the 
 * version-safe 'QueryOptions' to avoid the deprecation and missing member loop.
 */
import type { 
  DocumentNode, 
  OperationVariables, 
  QueryOptions, 
  MutationOptions 
} from '@apollo/client'

// FIX: 'extends OperationVariables' satisfies the Apollo 4 strict constraint
type QueryConfig<
  TData = any, 
  TVariables extends OperationVariables = OperationVariables
> = {
  query: DocumentNode
  // Omit 'query' because it's provided at the top level of QueryConfig
  options?: Omit<QueryOptions<TVariables, TData>, 'query'>
  skip?: boolean
}

type MutationConfig<
  TData = any, 
  TVariables extends OperationVariables = OperationVariables
> = {
  mutation: DocumentNode
  // Omit 'mutation' because it's provided at the top level of MutationConfig
  options?: Omit<MutationOptions<TData, TVariables>, 'mutation'>
}

type ApolloContainerConfig = {
  query?: QueryConfig
  mutation?: MutationConfig
}

export function useApolloContainer(config: ApolloContainerConfig) {
  const hasQuery = !!config.query
  const hasMutation = !!config.mutation

  /**
   * Always call hooks to maintain the hook call order.
   * skip: true prevents the network request when no query is provided.
   */
  const queryResult = useQuery(
    config.query?.query ?? ({} as DocumentNode),
    {
      ...config.query?.options,
      skip: !hasQuery || config.query?.skip,
    }
  )

  const [mutate, mutationResult] = useMutation(
    config.mutation?.mutation ?? ({} as DocumentNode),
    config.mutation?.options
  )

  return useMemo(() => {
    return {
      query: hasQuery ? queryResult : null,
      mutation: hasMutation
        ? {
            mutate,
            ...mutationResult,
          }
        : null,
    }
  }, [hasQuery, hasMutation, queryResult, mutate, mutationResult])
}