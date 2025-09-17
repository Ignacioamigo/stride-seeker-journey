import { useSafeAreaInsetsRobust } from "@/hooks/utils/useSafeAreaInsetsRobust";

export const useOnboardingLayout = () => {
  const safeAreaInsets = useSafeAreaInsetsRobust();
  const { top, bottom, left, right, isReady } = safeAreaInsets;

  // Header height calculation: safe area + content (64px)
  const headerHeight = (top || 0) + 64;
  
  return {
    isReady,
    headerHeight,
    paddingTop: headerHeight + 24, // header + additional spacing
    paddingBottom: (bottom || 0) + 80, // safe area + content spacing
    paddingLeft: Math.max(left || 0, 16),
    paddingRight: Math.max(right || 0, 16),
    safeAreaInsets: {
      top: top || 0,
      bottom: bottom || 0,
      left: left || 0,
      right: right || 0
    }
  };
};
