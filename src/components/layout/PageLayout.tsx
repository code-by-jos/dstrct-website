import { ReactNode } from 'react';
import { Heading } from '@/components/ui/Heading';
import { Container } from '@/components/ui/Container';

interface PageLayoutProps {
  title: string;
  children: ReactNode;
}

export function PageLayout({ title, children }: PageLayoutProps) {
  return (
    <Container className='pt-12 pb-32'>
      <Heading size='h1' variant='title'>
        {title}
      </Heading>
      {children}
    </Container>
  );
}
