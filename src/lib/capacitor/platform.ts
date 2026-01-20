import { Capacitor } from '@capacitor/core';

export const platform = {
  isNative: Capacitor.isNativePlatform(),
  isWeb: !Capacitor.isNativePlatform(),
  isAndroid: Capacitor.getPlatform() === 'android',
  isIOS: Capacitor.getPlatform() === 'ios',
  platform: Capacitor.getPlatform() as 'web' | 'android' | 'ios'
};
