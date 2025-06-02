import crypto from 'crypto';
import User from '../../models/User.js';
import AppError from '../../utils/AppError.js';
import { sendEmail } from '../../utils/email.js';

/**
 * Sends a verification email to the user
 */
const sendVerificationEmail = async (user, req) => {
  // 1) Generate the random verification token
  const verificationToken = user.createEmailVerificationToken();
  await user.save({ validateBeforeSave: false });

  // 2) Send it to user's email
  const verifyUrl = `${req.protocol}://${req.get('host')}/api/v1/auth/verify-email/${verificationToken}`;

  const message = `Welcome to our platform! Please verify your email by clicking on the link below:\n\n${verifyUrl}\n\nThis link is valid for 24 hours.`;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Your email verification token (valid for 24 hours)',
      message,
    });

    return true;
  } catch (err) {
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save({ validateBeforeSave: false });

    throw new AppError(
      'There was an error sending the verification email. Please try again later.',
      500
    );
  }
};

/**
 * Verifies a user's email
 */
export const verifyEmail = async (req, res, next) => {
  const { token } = req.params;

  try {
    if (!token) {
      return next(new AppError('Verification token is missing', 400));
    }

    // 1) Hash the token to match how it's stored in the database
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    // 2) Find user by hashed token and check expiration
    const user = await User.findOne({
      emailVerificationToken: hashedToken,
      emailVerificationExpires: { $gt: Date.now() },
    });

    if (!user) {
      // Check if token exists but is expired
      const expiredUser = await User.findOne({
        emailVerificationToken: hashedToken,
      });

      if (expiredUser) {
        return next(new AppError('Verification token has expired. Please request a new one.', 400));
      }

      return next(new AppError('Invalid verification token', 400));
    }

    // 3) Update user's email verification status
    user.emailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;

    await user.save({ validateBeforeSave: false });

    // 4) Log the user in, send JWT
    createSendToken(user, 200, res);
  } catch (err) {
    next(err);
  }
};

/**
 * Resends the verification email
 */
export const resendVerificationEmail = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return next(new AppError('Please provide an email address', 400));
    }

    const user = await User.findOne({ email });

    if (!user) {
      return next(new AppError('No user found with that email address', 404));
    }

    if (user.emailVerified) {
      return next(new AppError('Email is already verified', 400));
    }

    await sendVerificationEmail(user, req);

    res.status(200).json({
      status: 'success',
      message: 'Verification email sent! Please check your inbox.',
    });
  } catch (err) {
    next(err);
  }
};

// Import the createSendToken function from auth.utils.js
import { createSendToken } from './auth.utils.js';
