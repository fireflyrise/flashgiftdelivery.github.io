import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import { Order } from './supabase';
import { formatPrice } from './utils-pricing';
import { format } from 'date-fns';

// PDF Styles
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 11,
    fontFamily: 'Helvetica',
  },
  header: {
    marginBottom: 30,
    borderBottom: '2 solid #000',
    paddingBottom: 15,
  },
  logo: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  receiptTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  infoSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
    borderBottom: '1 solid #ccc',
    paddingBottom: 3,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  label: {
    fontWeight: 'bold',
    width: '40%',
  },
  value: {
    width: '60%',
  },
  itemsTable: {
    marginTop: 20,
    marginBottom: 20,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f0f0f0',
    padding: 8,
    fontWeight: 'bold',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottom: '1 solid #eee',
    padding: 8,
  },
  tableColItem: {
    width: '50%',
  },
  tableColPrice: {
    width: '25%',
    textAlign: 'right',
  },
  tableColQty: {
    width: '25%',
    textAlign: 'center',
  },
  totalsSection: {
    marginTop: 20,
    marginLeft: '50%',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  grandTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingTop: 10,
    borderTop: '2 solid #000',
    fontSize: 14,
    fontWeight: 'bold',
  },
  footer: {
    marginTop: 40,
    paddingTop: 20,
    borderTop: '1 solid #ccc',
    fontSize: 9,
    color: '#666',
  },
  guarantee: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#f9f9f9',
    borderLeft: '3 solid #4CAF50',
  },
});

interface ReceiptPDFProps {
  order: Order;
}

export const ReceiptPDF: React.FC<ReceiptPDFProps> = ({ order }) => {
  const orderDate = new Date(order.created_at);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.logo}>Flash Gift Delivery</Text>
          <Text>Premium Same-Day Flower Delivery</Text>
          <Text>Phone: (602) 829-0009</Text>
        </View>

        {/* Receipt Title */}
        <Text style={styles.receiptTitle}>RECEIPT</Text>

        {/* Order Information */}
        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>Order Information</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Order Number:</Text>
            <Text style={styles.value}>{order.order_number}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Order Date:</Text>
            <Text style={styles.value}>{format(orderDate, 'MMMM dd, yyyy h:mm a')}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Payment Status:</Text>
            <Text style={styles.value}>{order.payment_status.toUpperCase()}</Text>
          </View>
        </View>

        {/* Customer Information */}
        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>Customer Information</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Name:</Text>
            <Text style={styles.value}>{order.sender_name}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Email:</Text>
            <Text style={styles.value}>{order.sender_email}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Phone:</Text>
            <Text style={styles.value}>{order.sender_phone}</Text>
          </View>
        </View>

        {/* Delivery Information */}
        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>Delivery Information</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Recipient:</Text>
            <Text style={styles.value}>{order.recipient_name}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Address:</Text>
            <Text style={styles.value}>{order.delivery_address}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>City, State, ZIP:</Text>
            <Text style={styles.value}>{order.delivery_city}, {order.delivery_state} {order.delivery_zipcode}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Delivery Date:</Text>
            <Text style={styles.value}>{format(new Date(order.delivery_date), 'MMMM dd, yyyy')}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Time Slot:</Text>
            <Text style={styles.value}>{order.delivery_time_slot}</Text>
          </View>
          {order.gate_code && (
            <View style={styles.row}>
              <Text style={styles.label}>Gate Code:</Text>
              <Text style={styles.value}>{order.gate_code}</Text>
            </View>
          )}
          {order.delivery_instructions && (
            <View style={styles.row}>
              <Text style={styles.label}>Instructions:</Text>
              <Text style={styles.value}>{order.delivery_instructions}</Text>
            </View>
          )}
        </View>

        {/* Greeting Card */}
        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>Greeting Card</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Occasion:</Text>
            <Text style={styles.value}>{order.card_occasion}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Message:</Text>
            <Text style={styles.value}>"{order.card_message}"</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Signature:</Text>
            <Text style={styles.value}>{order.card_signature}</Text>
          </View>
        </View>

        {/* Items Table */}
        <View style={styles.itemsTable}>
          <View style={styles.tableHeader}>
            <Text style={styles.tableColItem}>Item</Text>
            <Text style={styles.tableColQty}>Quantity</Text>
            <Text style={styles.tableColPrice}>Price</Text>
          </View>

          <View style={styles.tableRow}>
            <Text style={styles.tableColItem}>{order.package_type.replace('_', ' ')} Premium Red Roses</Text>
            <Text style={styles.tableColQty}>1</Text>
            <Text style={styles.tableColPrice}>{formatPrice(order.package_price)}</Text>
          </View>

          {order.has_chocolates && (
            <View style={styles.tableRow}>
              <Text style={styles.tableColItem}>Godiva Premium Chocolates</Text>
              <Text style={styles.tableColQty}>1</Text>
              <Text style={styles.tableColPrice}>{formatPrice(order.chocolates_price)}</Text>
            </View>
          )}
        </View>

        {/* Totals */}
        <View style={styles.totalsSection}>
          <View style={styles.totalRow}>
            <Text>Subtotal:</Text>
            <Text>{formatPrice(order.subtotal)}</Text>
          </View>
          <View style={styles.grandTotal}>
            <Text>TOTAL PAID:</Text>
            <Text>{formatPrice(order.total)}</Text>
          </View>
        </View>

        {/* Guarantee */}
        <View style={styles.guarantee}>
          <Text style={{ fontWeight: 'bold', marginBottom: 5 }}>100% Money-Back Guarantee</Text>
          <Text style={{ fontSize: 9 }}>
            We guarantee your complete satisfaction. If you're not happy with your order,
            contact us for a full refund - no questions asked.
          </Text>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text>Thank you for choosing Flash Gift Delivery!</Text>
          <Text>For questions or support, email us or call (602) 829-0009</Text>
          <Text style={{ marginTop: 10 }}>
            Terms: All sales are final except as covered by our satisfaction guarantee.
            Delivery times are estimates and may vary based on traffic and weather conditions.
          </Text>
        </View>
      </Page>
    </Document>
  );
};
