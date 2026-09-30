import React from 'react';
import {
  Html,
  Head,
  Preview,
  Body,
  Container,
  Section,
  Row,
  Column,
  Heading,
  Text,
  Hr,
  Link,
} from '@react-email/components';

export interface InvoiceItem {
  id?: string | number;
  product_id?: string | number;
  name: string;
  shade_name?: string;
  quantity: number;
  price: number;
}

export interface InvoiceEmailProps {
  orderId: string | number;
  customerName: string;
  customerEmail: string;
  totalAmount: number;
  items: InvoiceItem[];
  purchaseDate: string;
}

export const InvoiceEmail: React.FC<InvoiceEmailProps> = ({
  orderId = 'AM-10842',
  customerName = 'Valued Client',
  customerEmail = 'client@example.com',
  totalAmount = 698,
  items = [
    {
      name: 'Hydravelvet Matte Lipstick',
      shade_name: 'Velvet Ribbon',
      quantity: 1,
      price: 349,
    },
    {
      name: 'Hydravelvet Matte Lipstick',
      shade_name: 'Berry Sovereign',
      quantity: 1,
      price: 349,
    },
  ],
  purchaseDate = new Date().toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }),
}) => {
  const formattedTotal = Number(totalAmount).toLocaleString('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  });

  return (
    <Html lang="en">
      <Head />
      <Preview>{`Your Amore Atelier Receipt — Order #${orderId}`}</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Atelier Brand Header */}
          <Section style={headerSection}>
            <Heading style={brandLogo}>AMORE</Heading>
            <Text style={brandSubtitle}>COSMETICS · ATELIER RECEIPT</Text>
          </Section>

          <Hr style={divider} />

          {/* Order Metadata */}
          <Section style={metaSection}>
            <Row>
              <Column>
                <Text style={metaLabel}>ORDER NUMBER</Text>
                <Text style={metaValue}>#{orderId}</Text>
              </Column>
              <Column align="right">
                <Text style={metaLabel}>DATE</Text>
                <Text style={metaValue}>{purchaseDate}</Text>
              </Column>
            </Row>
            <Row style={{ marginTop: '12px' }}>
              <Column>
                <Text style={metaLabel}>BILLED TO</Text>
                <Text style={metaValue}>{customerName}</Text>
                <Text style={metaSubvalue}>{customerEmail}</Text>
              </Column>
              <Column align="right">
                <Text style={metaLabel}>PAYMENT STATUS</Text>
                <Text style={statusBadge}>CONFIRMED</Text>
              </Column>
            </Row>
          </Section>

          <Hr style={divider} />

          {/* Editorial Welcome */}
          <Section style={greetingSection}>
            <Text style={greetingText}>
              Dear {customerName},
            </Text>
            <Text style={paragraph}>
              Thank you for choosing Amore. Your handcrafted lip care order has been
              received by our atelier and is being carefully prepared with our signature
              formulations of Blueberry Butter, Avocado Oil, and Vitamin E.
            </Text>
          </Section>

          {/* Itemized Order Table */}
          <Section style={itemsTableSection}>
            <Row style={tableHeaderRow}>
              <Column style={{ width: '60%' }}>
                <Text style={tableHeaderLabel}>ITEM & SHADE</Text>
              </Column>
              <Column style={{ width: '15%', textAlign: 'center' }}>
                <Text style={tableHeaderLabel}>QTY</Text>
              </Column>
              <Column style={{ width: '25%', textAlign: 'right' }}>
                <Text style={tableHeaderLabel}>AMOUNT</Text>
              </Column>
            </Row>

            <Hr style={subDivider} />

            {items && items.length > 0 ? (
              items.map((item, index) => {
                const itemTotal = (item.price * item.quantity).toLocaleString('en-IN', {
                  style: 'currency',
                  currency: 'INR',
                });
                return (
                  <Row key={index} style={itemRow}>
                    <Column style={{ width: '60%' }}>
                      <Text style={itemName}>{item.name}</Text>
                      {item.shade_name && (
                        <Text style={itemShade}>Shade: {item.shade_name}</Text>
                      )}
                    </Column>
                    <Column style={{ width: '15%', textAlign: 'center' }}>
                      <Text style={itemQty}>{item.quantity}</Text>
                    </Column>
                    <Column style={{ width: '25%', textAlign: 'right' }}>
                      <Text style={itemPrice}>{itemTotal}</Text>
                    </Column>
                  </Row>
                );
              })
            ) : (
              <Row>
                <Column>
                  <Text style={itemName}>Amore Hydravelvet Collection</Text>
                </Column>
              </Row>
            )}
          </Section>

          <Hr style={divider} />

          {/* Totals Summary */}
          <Section style={totalsSection}>
            <Row style={totalRow}>
              <Column style={{ width: '70%' }}>
                <Text style={totalsLabel}>Subtotal</Text>
              </Column>
              <Column style={{ width: '30%', textAlign: 'right' }}>
                <Text style={totalsValue}>{formattedTotal}</Text>
              </Column>
            </Row>
            <Row style={totalRow}>
              <Column style={{ width: '70%' }}>
                <Text style={totalsLabel}>Express Courier Shipping</Text>
              </Column>
              <Column style={{ width: '30%', textAlign: 'right' }}>
                <Text style={complimentaryText}>COMPLIMENTARY</Text>
              </Column>
            </Row>
            <Hr style={subDivider} />
            <Row style={{ marginTop: '10px' }}>
              <Column style={{ width: '60%' }}>
                <Text style={grandTotalLabel}>TOTAL PAID</Text>
              </Column>
              <Column style={{ width: '40%', textAlign: 'right' }}>
                <Text style={grandTotalValue}>{formattedTotal}</Text>
              </Column>
            </Row>
          </Section>

          {/* Atelier Sign-off & Footer */}
          <Section style={footerSection}>
            <Text style={signOff}>
              Hand-poured with love for your lips.
            </Text>
            <Text style={brandFooter}>
              AMORE COSMETICS ATELIER · MUMBAI, INDIA
            </Text>
            <Text style={helpText}>
              Need assistance with your order? Reach our concierges at{' '}
              <Link href="mailto:support@amorecosmetics.com" style={supportLink}>
                support@amorecosmetics.com
              </Link>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

export default InvoiceEmail;

// Luxury Aesthetic Styles
const main: React.CSSProperties = {
  backgroundColor: '#FAF9F6',
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
  padding: '40px 0',
  margin: 0,
};

const container: React.CSSProperties = {
  backgroundColor: '#FFFFFF',
  border: '1px solid #EAE8E4',
  borderRadius: '4px',
  maxWidth: '560px',
  margin: '0 auto',
  padding: '40px 36px',
};

const headerSection: React.CSSProperties = {
  textAlign: 'center',
  paddingBottom: '16px',
};

const brandLogo: React.CSSProperties = {
  fontFamily: "'Playfair Display', Georgia, serif",
  fontSize: '28px',
  fontWeight: '700',
  letterSpacing: '5px',
  color: '#1C1917',
  margin: '0 0 4px 0',
};

const brandSubtitle: React.CSSProperties = {
  fontSize: '11px',
  letterSpacing: '2.5px',
  color: '#857F77',
  margin: 0,
  textTransform: 'uppercase',
};

const divider: React.CSSProperties = {
  borderColor: '#EAE8E4',
  borderWidth: '1px',
  margin: '24px 0',
};

const subDivider: React.CSSProperties = {
  borderColor: '#F3F2EE',
  borderWidth: '1px',
  margin: '12px 0',
};

const metaSection: React.CSSProperties = {
  padding: '0 4px',
};

const metaLabel: React.CSSProperties = {
  fontSize: '10px',
  letterSpacing: '1.5px',
  color: '#857F77',
  textTransform: 'uppercase',
  margin: '0 0 2px 0',
  fontWeight: '600',
};

const metaValue: React.CSSProperties = {
  fontSize: '14px',
  fontWeight: '600',
  color: '#1C1917',
  margin: 0,
};

const metaSubvalue: React.CSSProperties = {
  fontSize: '12px',
  color: '#78716C',
  margin: '2px 0 0 0',
};

const statusBadge: React.CSSProperties = {
  display: 'inline-block',
  fontSize: '10px',
  fontWeight: '700',
  letterSpacing: '1px',
  color: '#15803D',
  backgroundColor: '#F0FDF4',
  border: '1px solid #BBF7D0',
  padding: '3px 8px',
  borderRadius: '3px',
  margin: '2px 0 0 0',
};

const greetingSection: React.CSSProperties = {
  padding: '0 4px',
  marginBottom: '8px',
};

const greetingText: React.CSSProperties = {
  fontSize: '15px',
  fontWeight: '600',
  color: '#1C1917',
  margin: '0 0 8px 0',
  fontFamily: "'Playfair Display', Georgia, serif",
};

const paragraph: React.CSSProperties = {
  fontSize: '13px',
  lineHeight: '1.6',
  color: '#57534E',
  margin: 0,
};

const itemsTableSection: React.CSSProperties = {
  marginTop: '16px',
};

const tableHeaderRow: React.CSSProperties = {
  paddingBottom: '4px',
};

const tableHeaderLabel: React.CSSProperties = {
  fontSize: '10px',
  letterSpacing: '1.2px',
  color: '#857F77',
  fontWeight: '700',
  margin: 0,
  textTransform: 'uppercase',
};

const itemRow: React.CSSProperties = {
  padding: '8px 0',
};

const itemName: React.CSSProperties = {
  fontSize: '13px',
  fontWeight: '600',
  color: '#1C1917',
  margin: '0 0 2px 0',
};

const itemShade: React.CSSProperties = {
  fontSize: '11px',
  color: '#78716C',
  margin: 0,
};

const itemQty: React.CSSProperties = {
  fontSize: '13px',
  color: '#44403C',
  margin: 0,
};

const itemPrice: React.CSSProperties = {
  fontSize: '13px',
  fontWeight: '600',
  color: '#1C1917',
  margin: 0,
};

const totalsSection: React.CSSProperties = {
  padding: '0 4px',
};

const totalRow: React.CSSProperties = {
  margin: '4px 0',
};

const totalsLabel: React.CSSProperties = {
  fontSize: '12px',
  color: '#78716C',
  margin: 0,
};

const totalsValue: React.CSSProperties = {
  fontSize: '12px',
  color: '#1C1917',
  fontWeight: '500',
  margin: 0,
};

const complimentaryText: React.CSSProperties = {
  fontSize: '11px',
  fontWeight: '600',
  letterSpacing: '1px',
  color: '#B45309',
  margin: 0,
};

const grandTotalLabel: React.CSSProperties = {
  fontSize: '13px',
  letterSpacing: '1.5px',
  fontWeight: '700',
  color: '#1C1917',
  margin: 0,
};

const grandTotalValue: React.CSSProperties = {
  fontFamily: "'Playfair Display', Georgia, serif",
  fontSize: '18px',
  fontWeight: '700',
  color: '#1C1917',
  margin: 0,
};

const footerSection: React.CSSProperties = {
  textAlign: 'center',
  paddingTop: '24px',
};

const signOff: React.CSSProperties = {
  fontFamily: "'Playfair Display', Georgia, serif",
  fontStyle: 'italic',
  fontSize: '14px',
  color: '#44403C',
  margin: '0 0 10px 0',
};

const brandFooter: React.CSSProperties = {
  fontSize: '10px',
  letterSpacing: '2px',
  color: '#A8A29E',
  margin: '0 0 12px 0',
};

const helpText: React.CSSProperties = {
  fontSize: '11px',
  color: '#78716C',
  margin: 0,
  lineHeight: '1.4',
};

const supportLink: React.CSSProperties = {
  color: '#1C1917',
  textDecoration: 'underline',
};
