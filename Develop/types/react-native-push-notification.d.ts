declare module 'react-native-push-notification'{
    export interface PushNotificationObject{

    message: string;
    title?: string;
    playSound?: boolean;
    soundName?: string;
    number?: number;
    repeatType?: 'time' | 'week' | 'day' | 'hour' | 'minute';
    repeatTime?: number;
    actions?: string;
    invokeApp?: boolean;
    date?: Date;
    allowWhileIdle?: boolean;
    channelId?: string;
    id?: string | number;
    [key: string]: any; // Catch-all for undocumented options
  }

  export interface ChannelObject {
    channelId: string;
    channelName: string;
    channelDescription?: string;
    soundName?: string;
    importance?: number;
    vibrate?: boolean;
  }

  export default class PushNotification {
    static configure(options: {
      onRegister?: (token: { os: string; token: string }) => void;
      onNotification?: (notification: any) => void;
      onAction?: (notification: any) => void;
      onRegistrationError?: (err: any) => void;
      permissions?: {
        alert?: boolean;
        badge?: boolean;
        sound?: boolean;
      };
      popInitialNotification?: boolean;
      requestPermissions?: boolean;
    }): void;

    static localNotification(details: PushNotificationObject): void;

    static localNotificationSchedule(details: PushNotificationObject): void;

    static cancelAllLocalNotifications(): void;

    static createChannel(
      channel: ChannelObject,
      callback?: (created: boolean) => void
    ): void;

    static checkPermissions(callback: (permissions: { alert: boolean; badge: boolean; sound: boolean }) => void): void;
  }
}