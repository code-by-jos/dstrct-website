import { Html, Head, Preview, Body, Container, Section, Heading, Text, Hr } from '@react-email/components';
import type { ApplicationServerData } from '@/schemas/applicationSchema';

interface AdminNotificationEmailProps {
  data: Omit<ApplicationServerData, 'photos' | 'termsAccepted' | 'website'>;
  photoCount: number;
}

export function AdminNotificationEmail({ data, photoCount }: AdminNotificationEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>
        New model application from {data.firstName} {data.lastName}
      </Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>
          <Heading style={styles.heading}>New Model Application</Heading>

          <Section style={styles.section}>
            <Heading as='h2' style={styles.subheading}>
              Personal Information
            </Heading>
            <Text style={styles.text}>
              <strong>Name:</strong> {data.firstName} {data.lastName}
            </Text>
            <Text style={styles.text}>
              <strong>Email:</strong> {data.email}
            </Text>
            <Text style={styles.text}>
              <strong>Phone:</strong> {data.phone}
            </Text>
            <Text style={styles.text}>
              <strong>Location:</strong> {data.city}, {data.country}
            </Text>
            <Text style={styles.text}>
              <strong>Date of Birth:</strong> {data.dateOfBirth}
            </Text>
            {data.instagram && (
              <Text style={styles.text}>
                <strong>Instagram:</strong> @{data.instagram.replace('@', '')}
              </Text>
            )}
            {data.agency && (
              <Text style={styles.text}>
                <strong>Current Agency:</strong> {data.agency}
              </Text>
            )}
          </Section>

          <Hr style={styles.hr} />

          <Section style={styles.section}>
            <Heading as='h2' style={styles.subheading}>
              Physical Stats
            </Heading>
            <Text style={styles.text}>
              <strong>Height:</strong> {data.height}
            </Text>
            <Text style={styles.text}>
              <strong>Waist:</strong> {data.waist}
            </Text>
            <Text style={styles.text}>
              <strong>Bust/Chest:</strong> {data.bust}
            </Text>
            <Text style={styles.text}>
              <strong>Hips:</strong> {data.hips}
            </Text>
            <Text style={styles.text}>
              <strong>Shoe Size:</strong> {data.shoeSize}
            </Text>
            <Text style={styles.text}>
              <strong>Hair Color:</strong> {data.hairColor}
            </Text>
            <Text style={styles.text}>
              <strong>Eye Color:</strong> {data.eyeColor}
            </Text>
          </Section>

          <Hr style={styles.hr} />

          <Section style={styles.section}>
            <Text style={styles.text}>
              <strong>Photos:</strong> {photoCount} photo(s) attached
            </Text>
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
    fontSize: '24px',
    fontWeight: '600',
    color: '#000000',
    marginBottom: '24px',
  },
  subheading: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#333333',
    marginBottom: '12px',
  },
  section: {
    marginBottom: '24px',
  },
  text: {
    fontSize: '14px',
    color: '#333333',
    lineHeight: '1.5',
    margin: '4px 0',
  },
  hr: {
    borderColor: '#e6e6e6',
    margin: '24px 0',
  },
};

export default AdminNotificationEmail;
