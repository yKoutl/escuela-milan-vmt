import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 11,
    fontFamily: 'Helvetica',
    backgroundColor: '#FFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
    borderBottomWidth: 3,
    borderBottomColor: '#DC2626',
    paddingBottom: 15,
  },
  logo: {
    width: 60,
    height: 60,
    marginRight: 10,
  },
  schoolInfo: {
    flexDirection: 'column',
  },
  schoolName: {
    fontSize: 18,
    fontFamily: 'Helvetica-Bold',
    color: '#DC2626',
  },
  subtitle: {
    fontSize: 10,
    color: '#666',
    marginTop: 3,
  },
  receiptInfo: {
    fontSize: 10,
    color: '#666',
    textAlign: 'right',
  },
  title: {
    fontSize: 16,
    fontFamily: 'Helvetica-Bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#1F2937',
  },
  status: {
    backgroundColor: '#10B981',
    color: 'white',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  section: {
    marginBottom: 15,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  label: {
    width: '40%',
    fontFamily: 'Helvetica-Bold',
    color: '#374151',
  },
  value: {
    width: '60%',
    color: '#1F2937',
  },
  amountSection: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
  },
  amountLabel: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    color: '#374151',
    marginBottom: 5,
  },
  amountValue: {
    fontSize: 20,
    fontFamily: 'Helvetica-Bold',
    color: '#DC2626',
  },
  footer: {
    position: 'absolute',
    bottom: 40,
    left: 40,
    right: 40,
    textAlign: 'center',
    fontSize: 9,
    color: '#6B7280',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 10,
  },
});

export default function PDFReceipt({ payment }) {
  const formatDate = (timestamp) => {
    if (!timestamp?.seconds) return new Date().toLocaleDateString('es-PE');
    return new Date(timestamp.seconds * 1000).toLocaleDateString('es-PE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const formatTime = (timestamp) => {
    if (!timestamp?.seconds) return new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });
    return new Date(timestamp.seconds * 1000).toLocaleTimeString('es-PE', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* HEADER */}
        <View style={styles.header}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Image src="https://i.postimg.cc/43L0J04m/logo_milan.png" style={styles.logo} />
            <View style={styles.schoolInfo}>
              <Text style={styles.schoolName}>ESCUELA DEPORTIVA MILAN</Text>
              <Text style={styles.subtitle}>Formando Campeones</Text>
            </View>
          </View>
          <View style={styles.receiptInfo}>
            <Text>Boleta N°: {payment.id?.substring(0, 8).toUpperCase()}</Text>
            <Text>Fecha: {formatDate(payment.paymentDate)}</Text>
          </View>
        </View>

        {/* TITLE */}
        <Text style={styles.title}>RECIBO DE PAGO</Text>

        {/* STATUS */}
        <View style={styles.status}>
          <Text>{payment.status || 'PAGADO'}</Text>
        </View>

        {/* STUDENT DATA */}
        <View style={styles.section}>
          <Text style={{ fontSize: 12, fontFamily: 'Helvetica-Bold', marginBottom: 10, color: '#374151' }}>
            Datos del Alumno
          </Text>
          <View style={styles.row}>
            <Text style={styles.label}>Nombre:</Text>
            <Text style={styles.value}>{payment.studentName}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Categoría:</Text>
            <Text style={styles.value}>{payment.category}</Text>
          </View>
        </View>

        {/* PAYMENT DETAILS */}
        <View style={styles.section}>
          <Text style={{ fontSize: 12, fontFamily: 'Helvetica-Bold', marginBottom: 10, color: '#374151' }}>
            Detalles del Pago
          </Text>
          <View style={styles.row}>
            <Text style={styles.label}>Concepto:</Text>
            <Text style={styles.value}>Mensualidad - {payment.month} {payment.year}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Fecha de Pago:</Text>
            <Text style={styles.value}>{formatDate(payment.paymentDate)} - {formatTime(payment.paymentDate)}</Text>
          </View>
          {payment.createdAt && (
            <View style={styles.row}>
              <Text style={styles.label}>Fecha de Registro:</Text>
              <Text style={styles.value}>{formatDate(payment.createdAt)} - {formatTime(payment.createdAt)}</Text>
            </View>
          )}
        </View>

        {/* AMOUNT */}
        <View style={styles.amountSection}>
          <Text style={styles.amountLabel}>MONTO TOTAL PAGADO:</Text>
          <Text style={styles.amountValue}>S/. {payment.amount}</Text>
        </View>

        {/* FOOTER */}
        <View style={styles.footer}>
          <Text>Este documento es un comprobante de pago válido.</Text>
          <Text style={{ marginTop: 3 }}>Escuela Deportiva Milan - Todos los derechos reservados</Text>
        </View>
      </Page>
    </Document>
  );
}
