/**
 * Tests para PushNotificationService
 * 
 * Tests unitarios simplificados del servicio de push notifications
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock de web-push
const mockSendNotification = vi.fn().mockResolvedValue({ statusCode: 201 });
const mockSetVapidDetails = vi.fn();

vi.mock('web-push', () => ({
  default: {
    setVapidDetails: mockSetVapidDetails,
    sendNotification: mockSendNotification,
  },
  setVapidDetails: mockSetVapidDetails,
  sendNotification: mockSendNotification,
}));

// Mock del modelo PushSubscription
const mockPushSubscription = {
  findOne: vi.fn(),
  create: vi.fn(),
  findAll: vi.fn(),
};

vi.mock('../models/PushSubscription', () => ({
  PushSubscription: mockPushSubscription,
}));

vi.mock('../models/User', () => ({
  User: {
    hasMany: vi.fn(),
  },
}));

describe('PushNotificationService - Basic Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Service Module', () => {
    it('should load the service module', async () => {
      const { PushNotificationService } = await import('./pushNotificationService');
      expect(PushNotificationService).toBeDefined();
      expect(PushNotificationService.subscribe).toBeDefined();
      expect(PushNotificationService.unsubscribe).toBeDefined();
      expect(PushNotificationService.sendToUser).toBeDefined();
    });
  });

  describe('subscribe', () => {
    it('should create new subscription when none exists', async () => {
      mockPushSubscription.findOne.mockResolvedValue(null);
      mockPushSubscription.create.mockResolvedValue({
        id: 1,
        user_id: 1,
        endpoint: 'https://test.com/push',
        p256dh_key: 'test-key',
        auth_key: 'test-auth',
      });

      const { PushNotificationService } = await import('./pushNotificationService');
      
      const result = await PushNotificationService.subscribe(
        1,
        {
          endpoint: 'https://test.com/push',
          keys: { p256dh: 'test-key', auth: 'test-auth' },
        },
        'Mozilla/5.0'
      );

      expect(result.success).toBe(true);
      expect(mockPushSubscription.create).toHaveBeenCalled();
    });

    it('should update existing subscription', async () => {
      const mockExisting = {
        id: 1,
        endpoint: 'https://test.com/push',
        update: vi.fn().mockResolvedValue(true),
      };

      mockPushSubscription.findOne.mockResolvedValue(mockExisting);

      const { PushNotificationService } = await import('./pushNotificationService');
      
      const result = await PushNotificationService.subscribe(
        1,
        {
          endpoint: 'https://test.com/push',
          keys: { p256dh: 'new-key', auth: 'new-auth' },
        },
        'Mozilla/5.0'
      );

      expect(result.success).toBe(true);
      expect(mockExisting.update).toHaveBeenCalled();
    });

    it('should handle errors gracefully', async () => {
      mockPushSubscription.findOne.mockRejectedValue(new Error('DB Error'));

      const { PushNotificationService } = await import('./pushNotificationService');
      
      const result = await PushNotificationService.subscribe(
        1,
        {
          endpoint: 'https://test.com/push',
          keys: { p256dh: 'key', auth: 'auth' },
        },
        'Mozilla/5.0'
      );

      expect(result.success).toBe(false);
    });
  });

  describe('unsubscribe', () => {
    it('should delete existing subscription', async () => {
      const mockExisting = {
        id: 1,
        endpoint: 'https://test.com/push',
        destroy: vi.fn().mockResolvedValue(true),
      };

      mockPushSubscription.findOne.mockResolvedValue(mockExisting);

      const { PushNotificationService } = await import('./pushNotificationService');
      
      const result = await PushNotificationService.unsubscribe(1, 'https://test.com/push');

      expect(result.success).toBe(true);
      expect(mockExisting.destroy).toHaveBeenCalled();
    });

    it('should return error when subscription not found', async () => {
      mockPushSubscription.findOne.mockResolvedValue(null);

      const { PushNotificationService } = await import('./pushNotificationService');
      
      const result = await PushNotificationService.unsubscribe(1, 'https://test.com/push');

      expect(result.success).toBe(false);
    });
  });

  describe('getUserSubscriptions', () => {
    it('should return user subscriptions', async () => {
      const mockSubscriptions = [
        { id: 1, endpoint: 'https://test1.com/push' },
        { id: 2, endpoint: 'https://test2.com/push' },
      ];

      mockPushSubscription.findAll.mockResolvedValue(mockSubscriptions);

      const { PushNotificationService } = await import('./pushNotificationService');
      
      const result = await PushNotificationService.getUserSubscriptions(1);

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(2);
    });
  });

  describe('sendToUser', () => {
    it('should send notification to user', async () => {
      const mockSubscriptions = [
        {
          id: 1,
          endpoint: 'https://test.com/push',
          p256dh_key: 'key',
          auth_key: 'auth',
          toJSON: () => ({
            endpoint: 'https://test.com/push',
            keys: { p256dh: 'key', auth: 'auth' },
          }),
        },
      ];

      mockPushSubscription.findAll.mockResolvedValue(mockSubscriptions);
      mockSendNotification.mockResolvedValue({ statusCode: 201 });

      const { PushNotificationService } = await import('./pushNotificationService');
      
      const result = await PushNotificationService.sendToUser(1, {
        title: 'Test',
        body: 'Message',
      });

      expect(result.success).toBe(true);
      expect(mockSendNotification).toHaveBeenCalled();
    });

    it('should return error when user has no subscriptions', async () => {
      mockPushSubscription.findAll.mockResolvedValue([]);

      const { PushNotificationService } = await import('./pushNotificationService');
      
      const result = await PushNotificationService.sendToUser(1, {
        title: 'Test',
        body: 'Message',
      });

      expect(result.success).toBe(false);
    });

    it('should handle 410 Gone errors and clean up invalid subscriptions', async () => {
      const mockInvalidSub = {
        id: 1,
        endpoint: 'https://invalid.com/push',
        p256dh_key: 'key',
        auth_key: 'auth',
        destroy: vi.fn().mockResolvedValue(true),
        toJSON: () => ({
          endpoint: 'https://invalid.com/push',
          keys: { p256dh: 'key', auth: 'auth' },
        }),
      };

      mockPushSubscription.findAll.mockResolvedValue([mockInvalidSub]);
      
      const error = new Error('Gone') as Error & { statusCode?: number };
      error.statusCode = 410;
      mockSendNotification.mockRejectedValue(error);

      const { PushNotificationService } = await import('./pushNotificationService');
      
      const result = await PushNotificationService.sendToUser(1, {
        title: 'Test',
        body: 'Message',
      });

      expect(mockInvalidSub.destroy).toHaveBeenCalled();
      expect(result.data?.failed).toBe(1);
    });
  });

  describe('sendTestNotification', () => {
    it('should send test notification', async () => {
      const mockSubscriptions = [
        {
          id: 1,
          endpoint: 'https://test.com/push',
          p256dh_key: 'key',
          auth_key: 'auth',
          toJSON: () => ({
            endpoint: 'https://test.com/push',
            keys: { p256dh: 'key', auth: 'auth' },
          }),
        },
      ];

      mockPushSubscription.findAll.mockResolvedValue(mockSubscriptions);
      mockSendNotification.mockResolvedValue({ statusCode: 201 });

      const { PushNotificationService } = await import('./pushNotificationService');
      
      const result = await PushNotificationService.sendTestNotification(1);

      expect(result.success).toBe(true);
      expect(mockSendNotification).toHaveBeenCalled();
    });
  });
});
