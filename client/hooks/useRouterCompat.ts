import {
  useNavigation,
  NavigationProp,
  CommonActions,
} from "@react-navigation/native";

type RootParamList = Record<string, object | undefined>;

function resolveRouteName(path: string): string {
  let cleaned = path
    .replace(/^\/?(\(tabs\)|\(onboarding\))\//, "")
    .replace(/^\//, "");

  return cleaned;
}

function findNavigatorForRoute(navigation: any, routeName: string): any {
  if (navigation.getState) {
    const state = navigation.getState();
    if (state?.routeNames?.includes(routeName)) {
      return navigation;
    }
  }

  if (navigation.getParent) {
    const parent = navigation.getParent();
    if (parent) {
      return findNavigatorForRoute(parent, routeName);
    }
  }

  return navigation;
}

export function useRouter() {
  const navigation = useNavigation<NavigationProp<RootParamList>>();

  return {
    push: (path: string, params?: Record<string, unknown>) => {
      const routeName = resolveRouteName(path);
      const targetNav = findNavigatorForRoute(navigation, routeName);
      targetNav.navigate(routeName, params);
    },
    replace: (path: string, params?: Record<string, unknown>) => {
      const routeName = resolveRouteName(path);
      const targetNav = findNavigatorForRoute(navigation, routeName);
      targetNav.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: routeName, params }],
        }),
      );
    },
    back: () => {
      if (navigation.canGoBack()) {
        navigation.goBack();
      }
    },
    canGoBack: () => navigation.canGoBack(),
  };
}
