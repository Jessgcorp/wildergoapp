/**
 * WilderGo RevenueCat Hook
 * Manages subscription state and purchase operations
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { Platform, Alert, AppState } from "react-native";
import Constants from "expo-constants";

interface CustomerInfo {
  entitlements: {
    active: Record<string, any>;
  };
}

interface Package {
  identifier: string;
  product: {
    identifier: string;
    priceString: string;
  };
}

interface UseRevenueCatReturn {
  isInitialized: boolean;
  isPremium: boolean;
  isLoading: boolean;
  packages: Package[];
  customerInfo: CustomerInfo | null;
  purchasePackage: (pkg: Package) => Promise<boolean>;
  restorePurchases: () => Promise<boolean>;
  checkEntitlement: (entitlementId: string) => boolean;
  logoutRevenueCat: () => Promise<void>;
}

const CONVOY_ENTITLEMENT_ID = "convoy";
const PREMIUM_ENTITLEMENT_ID = "premium";
const PRO_ENTITLEMENT_ID = "pro";

export const useRevenueCat = (): UseRevenueCatReturn => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null);
  const [packages, setPackages] = useState<Package[]>([]);

  // Flag to block listener updates during logout
  const isLoggingOut = useRef(false);

  // Function to check subscription status
  const checkProStatus = useCallback(async () => {
    if (isLoggingOut.current) {
      console.log("Skipping check - user is logging out");
      return;
    }

    try {
      const Purchases = await import("react-native-purchases").then(
        (m) => m.default,
      );
      const info = await Purchases.getCustomerInfo();
      if (info && info.entitlements) {
        setCustomerInfo(info);
      }
    } catch (e) {
      // If user is logged out, this might fail quietly. That's fine.
      console.log("Skipping check (User likely logged out)");
    }
  }, []);

  // Initialize RevenueCat
  useEffect(() => {
    const setup = async () => {
      try {
        const isExpoGo =
          Constants.appOwnership === "expo" ||
          Constants.executionEnvironment === "storeClient";

        if (isExpoGo || Platform.OS === "web") {
          console.log(
            `${isExpoGo ? "Expo Go" : "Web platform"} detected. Using RevenueCat in ${isExpoGo ? "Preview API" : "Browser"} Mode.`,
          );
          setIsLoading(false);
          return;
        }

        const apiKey = process.env.EXPO_PUBLIC_REVENUECAT_API_KEY;

        if (!apiKey) {
          console.log(
            "RevenueCat API key not configured - running in development mode",
          );
          setIsLoading(false);
          return;
        }

        const Purchases = await import("react-native-purchases").then(
          (m) => m.default,
        );

        try {
          Purchases.configure({ apiKey });
        } catch (configError: any) {
          console.log(
            "RevenueCat configure skipped:",
            configError?.message?.substring(0, 80),
          );
          setIsLoading(false);
          return;
        }

        await checkProStatus();

        try {
          const offerings = await Purchases.getOfferings();
          if (offerings.current?.availablePackages) {
            setPackages(offerings.current.availablePackages);
          }
        } catch (offeringsError) {
          console.log("Could not fetch offerings - continuing without them");
        }

        setIsInitialized(true);
      } catch (error: any) {
        if (
          error?.message?.includes("native store") ||
          error?.message?.includes("Invalid API key") ||
          error?.code === 11
        ) {
          console.log("RevenueCat not available in this environment");
        } else {
          console.log("RevenueCat setup issue:", error?.message || error);
        }
      } finally {
        setIsLoading(false);
      }
    };

    setup();

    // Safe replacement: Check when app comes to foreground
    const subscription = AppState.addEventListener("change", (nextAppState) => {
      if (nextAppState === "active" && !isLoggingOut.current) {
        console.log("App is active, checking subscription...");
        checkProStatus();
      }
    });

    return () => {
      subscription.remove();
    };
  }, [checkProStatus]);

  // Check if user has premium access
  const isPremium =
    customerInfo?.entitlements?.active?.[CONVOY_ENTITLEMENT_ID] !== undefined ||
    customerInfo?.entitlements?.active?.[PREMIUM_ENTITLEMENT_ID] !==
      undefined ||
    customerInfo?.entitlements?.active?.[PRO_ENTITLEMENT_ID] !== undefined;

  // Purchase a package
  const purchasePackage = useCallback(
    async (pkg: Package): Promise<boolean> => {
      if (!isInitialized) {
        Alert.alert("Error", "RevenueCat is not initialized");
        return false;
      }

      setIsLoading(true);

      try {
        const Purchases = await import("react-native-purchases").then(
          (m) => m.default,
        );
        const { customerInfo: newInfo } = await Purchases.purchasePackage(
          pkg as any,
        );
        setCustomerInfo(newInfo);

        return (
          newInfo.entitlements.active[CONVOY_ENTITLEMENT_ID] !== undefined ||
          newInfo.entitlements.active[PREMIUM_ENTITLEMENT_ID] !== undefined ||
          newInfo.entitlements.active[PRO_ENTITLEMENT_ID] !== undefined
        );
      } catch (error: any) {
        if (!error.userCancelled) {
          console.error("Purchase failed:", error);
          Alert.alert(
            "Purchase Failed",
            error.message || "An error occurred during purchase.",
          );
        }
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [isInitialized],
  );

  // Restore purchases
  const restorePurchases = useCallback(async (): Promise<boolean> => {
    if (!isInitialized) {
      Alert.alert("Error", "RevenueCat is not initialized");
      return false;
    }

    setIsLoading(true);

    try {
      const Purchases = await import("react-native-purchases").then(
        (m) => m.default,
      );
      const info = await Purchases.restorePurchases();
      setCustomerInfo(info);

      const hasPremium =
        info.entitlements.active[CONVOY_ENTITLEMENT_ID] !== undefined ||
        info.entitlements.active[PREMIUM_ENTITLEMENT_ID] !== undefined ||
        info.entitlements.active[PRO_ENTITLEMENT_ID] !== undefined;

      if (hasPremium) {
        Alert.alert("Success", "Your subscription has been restored!");
      } else {
        Alert.alert(
          "No Subscription Found",
          "No active subscription was found to restore.",
        );
      }

      return hasPremium;
    } catch (error: any) {
      console.error("Restore failed:", error);
      Alert.alert(
        "Restore Failed",
        error.message || "An error occurred while restoring purchases.",
      );
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [isInitialized]);

  // Check specific entitlement
  const checkEntitlement = useCallback(
    (entitlementId: string): boolean => {
      return customerInfo?.entitlements?.active?.[entitlementId] !== undefined;
    },
    [customerInfo],
  );

  // Logout from RevenueCat with nuclear flag
  const logoutRevenueCat = useCallback(async (): Promise<void> => {
    // Raise the flag immediately to block listener updates
    isLoggingOut.current = true;

    try {
      const Purchases = await import("react-native-purchases").then(
        (m) => m.default,
      );
      await Purchases.logOut();
      console.log("RevenueCat logout successful");
    } catch (error) {
      console.log("RevenueCat logout failed, ignoring:", error);
    }

    // Clear customer info
    setCustomerInfo(null);
  }, []);

  return {
    isInitialized,
    isPremium,
    isLoading,
    packages,
    customerInfo,
    purchasePackage,
    restorePurchases,
    checkEntitlement,
    logoutRevenueCat,
  };
};

export default useRevenueCat;
