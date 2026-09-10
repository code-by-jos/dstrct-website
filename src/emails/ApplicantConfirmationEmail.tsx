import { Html, Head, Preview, Body, Container, Section, Heading, Text, Hr } from '@react-email/components';
import { COMPANY_NAME } from '@/constants/email';

interface ApplicantConfirmationEmailProps {
  firstName: string;
}

export function ApplicantConfirmationEmail({ firstName }: ApplicantConfirmationEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Thank you for your application to {COMPANY_NAME}</Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>
          <Heading style={styles.heading}>{COMPANY_NAME}</Heading>

          <Section style={styles.section}>
            <Text style={styles.greeting}>Dear {firstName},</Text>
            <Text style={styles.text}>
              Thank you for your interest in joining {COMPANY_NAME}. We have received your application and our team will review it carefully.
            </Text>
            <Text style={styles.text}>
              If your profile matches our current requirements, we will contact you within five working days to discuss the next steps.
            </Text>
          </Section>

          <Hr style={styles.hr} />

          <Section style={styles.section}>
            <Text style={styles.signature}>
              Best regards,
              <br />
              The {COMPANY_NAME} Team
            </Text>
          </Section>

          <Section style={styles.footer}>
            <Text style={styles.footerText}>This is an automated message. Please do not reply to this email.</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

const styles = {
  body: {
    backgroundColor: '#f6f6f6',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    padding: '40px 20px',
  },
  container: {
    backgroundColor: '#ffffff',
    borderRadius: '8px',
    padding: '40px',
    maxWidth: '600px',
    margin: '0 auto',
  },
  heading: {
    fontSize: '28px',
    fontWeight: '300',
    letterSpacing: '4px',
    color: '#000000',
    marginBottom: '32px',
    textAlign: 'center' as const,
  },
  section: {
    marginBottom: '24px',
  },
  greeting: {
    fontSize: '16px',
    color: '#333333',
    marginBottom: '16px',
  },
  text: {
    fontSize: '14px',
    color: '#333333',
    lineHeight: '1.6',
    marginBottom: '12px',
  },
  signature: {
    fontSize: '14px',
    color: '#333333',
    lineHeight: '1.6',
  },
  hr: {
    borderColor: '#e6e6e6',
    margin: '24px 0',
  },
  footer: {
    marginTop: '32px',
  },
  footerText: {
    fontSize: '12px',
    color: '#999999',
    textAlign: 'center' as const,
  },
};

export default ApplicantConfirmationEmail;
