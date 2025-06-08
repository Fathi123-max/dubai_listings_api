import express from 'express';
import { protect } from '../middleware/auth.middleware.js';
import { signup, login, logout, getMe } from '../controllers/auth/auth.controller.js';
import {
  forgotPassword,
  resetPassword,
  updatePassword,
} from '../controllers/auth/password.controller.js';
import {
  verifyEmail,
  resendVerificationEmail,
} from '../controllers/auth/verification.controller.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication and user management
 *
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: The auto-generated id of the user
 *         name:
 *           type: string
 *           description: The user name
 *         email:
 *           type: string
 *           format: email
 *           description: The user email
 *         role:
 *           type: string
 *           enum: [user, admin]
 *           description: User role
 *     Login:
 *       type: object
 *       required:
 *         - email
 *         - password
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           description: User's email
 *         password:
 *           type: string
 *           format: password
 *           minLength: 8
 *           description: User's password (min 8 characters)
 *     Signup:
 *       allOf:
 *         - $ref: '#/components/schemas/Login'
 *         - type: object
 *           required:
 *             - name
 *             - passwordConfirm
 *           properties:
 *             name:
 *               type: string
 *               description: User's full name
 *             passwordConfirm:
 *               type: string
 *               format: password
 *               description: Must match the password field
 *     Token:
 *       type: object
 *       properties:
 *         token:
 *           type: string
 *           description: JWT token for authentication
 *         user:
 *           $ref: '#/components/schemas/User'
 */

// Router and controllers are already imported at the top

/**
 * @swagger
 * /api/v1/auth/signup:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Signup'
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Token'
 *       400:
 *         description: Invalid input
 */
router.post('/signup', signup);

/**
 * @swagger
 * /api/v1/auth/login:
 *   post:
 *     summary: Log in a user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Login'
 *     responses:
 *       200:
 *         description: Successfully logged in
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Token'
 *       401:
 *         description: Invalid credentials
 */
router.post('/login', login);
/**
 * @swagger
 * /api/v1/auth/logout:
 *   get:
 *     summary: Log out the current user
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Successfully logged out
 */
router.get('/logout', logout);
/**
 * @swagger
 * /api/v1/auth/forgot-password:
 *   post:
 *     summary: Request password reset
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       200:
 *         description: Password reset email sent
 *       404:
 *         description: No user found with that email
 */
router.post('/forgot-password', forgotPassword);

/**
 * @swagger
 * /api/v1/auth/reset-password/{token}:
 *   patch:
 *     summary: Reset password with token
 *     tags: [Auth]
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: Password reset token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - password
 *               - passwordConfirm
 *             properties:
 *               password:
 *                 type: string
 *                 format: password
 *                 minLength: 8
 *               passwordConfirm:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password updated successfully
 *       400:
 *         description: Invalid token or expired
 */
router.patch('/reset-password/:token', resetPassword);

/**
 * @swagger
 * /api/v1/auth/verify-email/{token}:
 *   get:
 *     summary: Verify email with token (GET)
 *     tags: [Auth]
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: Email verification token
 *     responses:
 *       200:
 *         description: Email verified successfully
 *       400:
 *         description: Invalid or expired token
 */
router.get('/verify-email/:token', verifyEmail);

/**
 * @swagger
 * /api/v1/auth/verify-email/{token}:
 *   post:
 *     summary: Verify email with token (POST)
 *     tags: [Auth]
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: Email verification token
 *     responses:
 *       200:
 *         description: Email verified successfully
 *       400:
 *         description: Invalid or expired token
 */
router.post('/verify-email/:token', verifyEmail);

/**
 * @swagger
 * /api/v1/auth/resend-verification-email:
 *   post:
 *     summary: Resend verification email
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       200:
 *         description: Verification email sent
 *       400:
 *         description: Email is already verified or user not found
 */
router.post('/resend-verification-email', resendVerificationEmail);

// Protected routes (require authentication)
router.use(protect);

/**
 * @swagger
 * /api/v1/auth/me:
 *   get:
 *     summary: Get current user's profile
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current user's profile
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       401:
 *         description: Not authenticated
 */
router.get('/me', getMe);

/**
 * @swagger
 * /api/v1/auth/update-password:
 *   patch:
 *     summary: Update current user's password
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currentPassword
 *               - newPassword
 *               - passwordConfirm
 *             properties:
 *               currentPassword:
 *                 type: string
 *                 format: password
 *               newPassword:
 *                 type: string
 *                 format: password
 *                 minLength: 8
 *               passwordConfirm:
 *                 type: string
 *                 format: password
 *     responses:
 *       200:
 *         description: Password updated successfully
 *       400:
 *         description: Current password is incorrect or invalid input
 *       401:
 *         description: Not authenticated
 */
router.patch('/update-password', updatePassword);

export default router;
