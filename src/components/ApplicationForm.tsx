import { useState, useCallback } from 'react';
import { Form } from 'react-aria-components';
import { parseDate } from '@internationalized/date';
import { TextField } from '@/components/ui/input/TextField';
import { DateField } from '@/components/ui/input/DateField';
import { Checkbox } from '@/components/ui/input/Checkbox';
import { FileUpload } from '@/components/ui/input/FileUpload';
import { Button } from '@/components/ui/Button';
import { Link } from '@/components/ui/Link';
import { Container } from '@/components/ui/Container';
import { applicationSchema, type ApplicationFormData } from '@/schemas/applicationSchema';
import { submitApplication, type SubmitApplicationResult } from '@/server/submitApplication';

interface FormState {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  city: string;
  country: string;
  dateOfBirth: string;
  instagram: string;
  agency: string;
  height: string;
  waist: string;
  bust: string;
  hips: string;
  shoeSize: string;
  hairColor: string;
  eyeColor: string;
  photo1: File | null;
  photo2: File | null;
  photo3: File | null;
  termsAccepted: boolean;
  website: string; // Honeypot
}

interface FormErrors {
  [key: string]: string | undefined;
}

const initialState: FormState = {
  firstName: '',
  lastName: '',
  phone: '',
  email: '',
  city: '',
  country: '',
  dateOfBirth: '',
  instagram: '',
  agency: '',
  height: '',
  waist: '',
  bust: '',
  hips: '',
  shoeSize: '',
  hairColor: '',
  eyeColor: '',
  photo1: null,
  photo2: null,
  photo3: null,
  termsAccepted: false,
  website: '',
};

async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // Remove data URL prefix to get just the base64
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

interface ApplicationFormProps {
  onSuccess: () => void;
}

export function ApplicationForm({ onSuccess }: ApplicationFormProps) {
  const [formState, setFormState] = useState<FormState>(initialState);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const updateField = useCallback(
    <K extends keyof FormState>(field: K, value: FormState[K]) => {
      setFormState((prev) => ({ ...prev, [field]: value }));
      // Clear error when field is updated
      if (errors[field]) {
        setErrors((prev) => ({ ...prev, [field]: undefined }));
      }
    },
    [errors],
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    setErrors({});

    // Build form data for validation
    const formData: Partial<ApplicationFormData> = {
      firstName: formState.firstName,
      lastName: formState.lastName,
      phone: formState.phone,
      email: formState.email,
      city: formState.city,
      country: formState.country,
      dateOfBirth: formState.dateOfBirth,
      instagram: formState.instagram || undefined,
      agency: formState.agency || undefined,
      height: formState.height,
      waist: formState.waist,
      bust: formState.bust,
      hips: formState.hips,
      shoeSize: formState.shoeSize,
      hairColor: formState.hairColor,
      eyeColor: formState.eyeColor,
      photo1: formState.photo1 || undefined,
      photo2: formState.photo2 || undefined,
      photo3: formState.photo3 || undefined,
      termsAccepted: formState.termsAccepted as true,
      website: formState.website,
    };

    // Validate with Zod
    const result = applicationSchema.safeParse(formData);

    if (!result.success) {
      const fieldErrors: FormErrors = {};
      result.error.issues.forEach((issue) => {
        const field = issue.path[0] as string;
        if (!fieldErrors[field]) {
          fieldErrors[field] = issue.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      // Convert photos to base64 for server
      const photos: Array<{ filename: string; contentType: string; base64: string }> = [];

      if (formState.photo1) {
        photos.push({
          filename: formState.photo1.name,
          contentType: formState.photo1.type,
          base64: await fileToBase64(formState.photo1),
        });
      }
      if (formState.photo2) {
        photos.push({
          filename: formState.photo2.name,
          contentType: formState.photo2.type,
          base64: await fileToBase64(formState.photo2),
        });
      }
      if (formState.photo3) {
        photos.push({
          filename: formState.photo3.name,
          contentType: formState.photo3.type,
          base64: await fileToBase64(formState.photo3),
        });
      }

      const serverData = {
        firstName: formState.firstName,
        lastName: formState.lastName,
        phone: formState.phone,
        email: formState.email,
        city: formState.city,
        country: formState.country,
        dateOfBirth: formState.dateOfBirth,
        instagram: formState.instagram,
        agency: formState.agency,
        height: formState.height,
        waist: formState.waist,
        bust: formState.bust,
        hips: formState.hips,
        shoeSize: formState.shoeSize,
        hairColor: formState.hairColor,
        eyeColor: formState.eyeColor,
        termsAccepted: true as const,
        website: formState.website,
        photos,
      };

      const response: SubmitApplicationResult = await submitApplication({ data: serverData });

      if (response.success) {
        onSuccess();
      } else {
        if (response.field) {
          setErrors({ [response.field]: response.error });
        } else {
          setSubmitError(response.error);
        }
      }
    } catch (error) {
      console.error('Form submission error:', error);
      setSubmitError('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Container className='py-12'>
      <Form onSubmit={handleSubmit} className='space-y-8'>
        {/* Honeypot field - hidden from real users */}
        <div className='absolute -left-[9999px]' aria-hidden='true'>
          <TextField label='Website' value={formState.website} onChange={(value) => updateField('website', value)} autoComplete='off' />
        </div>

        {/* Personal Information */}
        <section>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4'>
            <TextField
              label='First Name *'
              value={formState.firstName}
              onChange={(value) => updateField('firstName', value)}
              errorMessage={errors.firstName}
              autoComplete='given-name'
            />
            <TextField
              label='Last Name *'
              value={formState.lastName}
              onChange={(value) => updateField('lastName', value)}
              errorMessage={errors.lastName}
              autoComplete='family-name'
            />
            <TextField
              label='Phone *'
              value={formState.phone}
              onChange={(value) => updateField('phone', value)}
              errorMessage={errors.phone}
              autoComplete='tel'
              type='tel'
            />
            <TextField
              label='Email *'
              value={formState.email}
              onChange={(value) => updateField('email', value)}
              errorMessage={errors.email}
              autoComplete='email'
              type='email'
            />
            <TextField label='City *' value={formState.city} onChange={(value) => updateField('city', value)} errorMessage={errors.city} />
            <TextField
              label='Country *'
              value={formState.country}
              onChange={(value) => updateField('country', value)}
              errorMessage={errors.country}
            />
            <DateField
              label='Date of Birth *'
              value={formState.dateOfBirth ? parseDate(formState.dateOfBirth) : undefined}
              onChange={(value) => updateField('dateOfBirth', value ? value.toString() : '')}
              errorMessage={errors.dateOfBirth}
            />
            <TextField
              label='Instagram'
              value={formState.instagram}
              onChange={(value) => updateField('instagram', value)}
              errorMessage={errors.instagram}
              placeholder='@username'
            />
            <TextField
              label='Current Agency (if any)'
              value={formState.agency}
              onChange={(value) => updateField('agency', value)}
              errorMessage={errors.agency}
              className='md:col-span-2'
            />
          </div>
        </section>

        {/* Physical Stats */}
        <section>
          <div className='grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-4'>
            <TextField
              label='Height *'
              value={formState.height}
              onChange={(value) => updateField('height', value)}
              errorMessage={errors.height}
              placeholder='e.g. 175cm'
            />
            <TextField
              label='Waist *'
              value={formState.waist}
              onChange={(value) => updateField('waist', value)}
              errorMessage={errors.waist}
              placeholder='e.g. 65cm'
            />
            <TextField
              label='Bust/Chest *'
              value={formState.bust}
              onChange={(value) => updateField('bust', value)}
              errorMessage={errors.bust}
              placeholder='e.g. 85cm'
            />
            <TextField
              label='Hips *'
              value={formState.hips}
              onChange={(value) => updateField('hips', value)}
              errorMessage={errors.hips}
              placeholder='e.g. 90cm'
            />
            <TextField
              label='Shoe Size *'
              value={formState.shoeSize}
              onChange={(value) => updateField('shoeSize', value)}
              errorMessage={errors.shoeSize}
              placeholder='e.g. EU 39'
            />
            <TextField
              label='Hair Color *'
              value={formState.hairColor}
              onChange={(value) => updateField('hairColor', value)}
              errorMessage={errors.hairColor}
            />
            <TextField
              label='Eye Color *'
              value={formState.eyeColor}
              onChange={(value) => updateField('eyeColor', value)}
              errorMessage={errors.eyeColor}
            />
          </div>
        </section>

        {/* Photos */}
        <section>
          <div className='grid grid-cols-1 sm:grid-cols-3 gap-4'>
            <FileUpload
              label='Photo 1'
              value={formState.photo1}
              onChange={(file) => updateField('photo1', file)}
              errorMessage={errors.photo1}
              required
            />
            <FileUpload label='Photo 2' value={formState.photo2} onChange={(file) => updateField('photo2', file)} errorMessage={errors.photo2} />
            <FileUpload label='Photo 3' value={formState.photo3} onChange={(file) => updateField('photo3', file)} errorMessage={errors.photo3} />
          </div>
        </section>

        {/* Terms */}
        <section>
          <Checkbox
            isSelected={formState.termsAccepted}
            onChange={(value) => updateField('termsAccepted', value)}
            errorMessage={errors.termsAccepted}
          >
            I agree to the{' '}
            <Link to='/privacy' className='underline'>
              Privacy Policy
            </Link>{' '}
            and{' '}
            <Link to='/guidelines' className='underline'>
              Guidelines
            </Link>
          </Checkbox>
        </section>

        {/* Submit Error */}
        {submitError && (
          <div className='p-4 bg-red-50 border border-red-200 rounded-lg'>
            <p className='text-sm text-red-600'>{submitError}</p>
          </div>
        )}

        {/* Submit Button */}
        <Button type='submit' isDisabled={isSubmitting} className='w-full sm:w-auto'>
          {isSubmitting ? 'Submitting...' : 'Submit Application'}
        </Button>
      </Form>
    </Container>
  );
}
