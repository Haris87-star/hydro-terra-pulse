// Native Haptics Manager for Smartphone Touch Interaction
// Uses navigator.vibrate when supported on mobile devices

export const triggerHaptic = (type = 'light') => {
  if (typeof window === 'undefined' || !navigator.vibrate) return;

  try {
    switch (type) {
      case 'light':
        // Soft button tap
        navigator.vibrate(12);
        break;
      case 'medium':
        // Action toggle / selection
        navigator.vibrate(28);
        break;
      case 'heavy':
        // Critical action / purge
        navigator.vibrate([40, 30, 40]);
        break;
      case 'success':
        // Telemetry lock / calibration confirmed
        navigator.vibrate([15, 50, 25]);
        break;
      case 'warning':
        // Leak detection / hazard alert
        navigator.vibrate([60, 40, 60, 40, 80]);
        break;
      case 'sonar':
        // Acoustic pulse sync
        navigator.vibrate([8, 20, 8]);
        break;
      default:
        navigator.vibrate(15);
    }
  } catch (err) {
    // Graceful silent fail on unsupported hardware
  }
};
