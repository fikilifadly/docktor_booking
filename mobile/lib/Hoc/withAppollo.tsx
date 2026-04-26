// This version is safe because the hooks are called

import { useMutation, useQuery } from "@apollo/client/react"

// directly in the component body, not inside a loop or IF.
const withApollo = (queryOp: any, mutationOp: any) => (Component: any) => {
  const WrappedComponent = (props: any) => {
    // We call them every time. We use the 'skip' option
    // to handle the "condition" without breaking the hook order.
    const queryResult = useQuery(queryOp?.query, {
      ...queryOp?.options,
      skip: !queryOp?.query,
    });

    const [mutate, mutationResult] = useMutation(mutationOp?.mutation ?? null);

    return (
      <Component
        {...props}
        query={queryResult}
        mutate={mutate}
      />
    );
  };

  WrappedComponent.displayName = `withApollo(${Component.name})`;
  return WrappedComponent;
};

export default withApollo