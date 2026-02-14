import { Router } from 'express';
import { logoutCurrentDeviceController, logoutAllDevicesController, getActiveDevicesController } from './device.controller.ts';
import { verifyAuth } from '../../shared/middlewares/authMiddleware.ts';

const deviceRouter = Router();

// Get all active devices for current user
deviceRouter.get('/devices', verifyAuth(), getActiveDevicesController);

// Logout from current device
deviceRouter.post('/logout/current', verifyAuth(), logoutCurrentDeviceController);

// Logout from all devices
deviceRouter.post('/logout/all', verifyAuth(), logoutAllDevicesController);

export default deviceRouter;

