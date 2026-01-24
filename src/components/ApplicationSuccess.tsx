import { Container } from '@/components/ui/Container';
import { Heading } from '@/components/ui/Heading';
import { Link } from '@/components/ui/Link';
import { CheckCircle } from 'lucide-react';

export function ApplicationSuccess() {
  return (
    <Container className='py-12'>
      <div className='max-w-md mx-auto text-center'>
        <div className='flex justify-center mb-6'>
          <CheckCircle className='w-16 h-16 text-green-500' strokeWidth={1.5} />
        </div>

        <Heading as='h1' className='mb-4'>
          Application Submitted
        </Heading>

        <div className='space-y-4 text-gray-600'>
          <p>Thank you for your interest in joining DSTRCT.</p>
          <p>
            We have received your application and will review it carefully. If your profile matches our current requirements, we will contact you
            within the next few weeks.
          </p>
          <p>A confirmation email has been sent to your inbox.</p>
        </div>

        <div className='mt-8'>
          <Link to='/' className='inline-block px-6 py-2 bg-black text-white hover:bg-gray-800 transition-colors'>
            Return to Home
          </Link>
        </div>
      </div>
    </Container>
  );
}
