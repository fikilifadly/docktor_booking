import { useAppStore } from '../../store'

export const withStore =
  (mapStateToProps?: any) =>
    (Component: React.ComponentType<any>) =>
      (props: any) => {
        const store = useAppStore()

        const mapped = mapStateToProps
          ? mapStateToProps(store)
          : {}

        return <Component {...props} {...mapped} />
      }
