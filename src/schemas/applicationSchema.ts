import { z } from 'zod';
import { MAX_FILE_SIZE, ALLOWED_IMAGE_TYPES } from '@/constants/email';

/**
 * Schema for validating photo uploads
 */
const photoSchema = z
  .instanceof(File)
  .refine((file) => file.size <= MAX_FILE_SIZE, {
    message: 'File size must be less than 10MB',
  })
  .refine((file) => ALLOWED_IMAGE_TYPES.includes(file.type as (typeof ALLOWED_IMAGE_TYPES)[number]), {
    message: 'File must be an image (JPEG, PNG, WebP, or HEIC)',
  });

/**
 * Schema for the complete application form
 */
export const applicationSchema = z.object({
  // Personal Information
  firstName: z.string().min(1, 'First name is required').max(100, 'First name is too long'),
  lastName: z.string().min(1, 'Last name is required').max(100, 'Last name is too long'),
  phone: z.string().min(1, 'Phone number is required').max(30, 'Phone number is too long'),
  email: z.string().min(1, 'Email is required').email('Please enter a valid email address'),
  city: z.string().min(1, 'City is required').max(100, 'City is too long'),
  country: z.string().min(1, 'Country is required').max(100, 'Country is too long'),
  dateOfBirth: z.string().min(1, 'Date of birth is required'),
  instagram: z.string().max(100, 'Instagram handle is too long').optional().or(z.literal('')),

  // Agency (optional)
  agency: z.string().max(200, 'Agency name is too long').optional().or(z.literal('')),

  // Physical Stats
  height: z.string().min(1, 'Height is required').max(20, 'Height is too long'),
  waist: z.string().min(1, 'Waist measurement is required').max(20, 'Waist is too long'),
  bust: z.string().min(1, 'Bust/Chest measurement is required').max(20, 'Bust/Chest is too long'),
  hips: z.string().min(1, 'Hips measurement is required').max(20, 'Hips is too long'),
  shoeSize: z.string().min(1, 'Shoe size is required').max(20, 'Shoe size is too long'),
  hairColor: z.string().min(1, 'Hair color is required').max(50, 'Hair color is too long'),
  eyeColor: z.string().min(1, 'Eye color is required').max(50, 'Eye color is too long'),

  // Photos (at least one required)
  photo1: photoSchema,
  photo2: photoSchema.optional(),
  photo3: photoSchema.optional(),

  // Terms acceptance
  termsAccepted: z.literal(true, 'You must accept the Terms & Conditions'),

  // Honeypot field (must be empty)
  website: z.string().max(0, 'Invalid submission').optional(),
});

export type ApplicationFormData = z.infer<typeof applicationSchema>;

/**
 * Schema for server-side validation (without File objects, uses base64)
 */
export const applicationServerSchema = z.object({
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  phone: z.string().min(1).max(30),
  email: z.string().email(),
  city: z.string().min(1).max(100),
  country: z.string().min(1).max(100),
  dateOfBirth: z.string().min(1),
  instagram: z.string().max(100).optional().or(z.literal('')),
  agency: z.string().max(200).optional().or(z.literal('')),
  height: z.string().min(1).max(20),
  waist: z.string().min(1).max(20),
  bust: z.string().min(1).max(20),
  hips: z.string().min(1).max(20),
  shoeSize: z.string().min(1).max(20),
  hairColor: z.string().min(1).max(50),
  eyeColor: z.string().min(1).max(50),
  termsAccepted: z.literal(true),
  website: z.string().max(0).optional(),
  photos: z.array(
    z.object({
      filename: z.string(),
      contentType: z.string(),
      base64: z.string(),
    })
  ),
});

export type ApplicationServerData = z.infer<typeof applicationServerSchema>;
