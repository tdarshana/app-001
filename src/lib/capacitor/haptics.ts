import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';
import { platform } from './platform';

export const haptics = {
  async impact(style: 'light' | 'medium' | 'heavy' = 'medium') {
    if (!platform.isNative) return;

    const styleMap = {
      light: ImpactStyle.Light,
      medium: ImpactStyle.Medium,
      heavy: ImpactStyle.Heavy
    };

    await Haptics.impact({ style: styleMap[style] });
  },

  async notification(type: 'success' | 'warning' | 'error') {
    if (!platform.isNative) return;

    const typeMap = {
      success: NotificationType.Success,
      warning: NotificationType.Warning,
      error: NotificationType.Error
    };

    await Haptics.notification({ type: typeMap[type] });
  },

  async vibrate() {
    if (!platform.isNative) return;
    await Haptics.vibrate();
  },

  // Convenience methods for quiz feedback
  async correctAnswer() {
    await this.notification('success');
  },

  async wrongAnswer() {
    await this.notification('error');
  },

  async buttonPress() {
    await this.impact('light');
  }
};
