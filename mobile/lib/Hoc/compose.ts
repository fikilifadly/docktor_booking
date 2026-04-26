export const compose =
  (...hocs: any[]) =>
    (Component: any) =>
      hocs.reduceRight(
        (acc, hoc) => hoc(acc),
        Component
      )