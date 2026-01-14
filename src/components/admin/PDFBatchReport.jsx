import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 11,
    fontFamily: 'Helvetica',
    backgroundColor: '#FFF', // fondo limpio
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
    fontSize: 20,
    fontFamily: 'Helvetica-Bold',
    color: '#DC2626',
  },
  subtitle: {
    fontSize: 10,
    color: '#666',
    marginTop: 3,
  },
  dateInfo: {
    fontSize: 10,
    color: '#666',
    textAlign: 'right',
  },
  title: {
    fontSize: 18,
    fontFamily: 'Helvetica-Bold',
    textAlign: 'center',
    marginBottom: 25,
    color: '#1F2937',
  },
  studentInfo: {
    backgroundColor: '#F3F4F6',
    padding: 15,
    borderRadius: 8,
    marginBottom: 25,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  infoLabel: {
    width: '30%',
    fontFamily: 'Helvetica-Bold',
    color: '#374151',
  },
  infoValue: {
    width: '70%',
    color: '#1F2937',
  },
  table: {
    marginTop: 10,
    borderRadius: 5,
    overflow: 'hidden',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#DC2626',
    padding: 8,
    fontFamily: 'Helvetica-Bold',
    color: 'white',
    fontSize: 10,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    padding: 8,
    fontSize: 10,
  },
  col1: { width: '8%' },
  col2: { width: '25%' },
  col3: { width: '27%' },
  col4: { width: '20%' },
  col5: { width: '20%', textAlign: 'right' },
  summary: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 11,
    color: '#374151',
  },
  summaryValue: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: '#1F2937',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 2,
    borderTopColor: '#DC2626',
    paddingTop: 10,
    marginTop: 5,
  },
  totalLabel: {
    fontSize: 14,
    fontFamily: 'Helvetica-Bold',
    color: '#374151',
  },
  totalValue: {
    fontSize: 16,
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

export default function PDFBatchReport({ studentName, payments, category }) {
  const formatDate = (timestamp) => {
    if (!timestamp?.seconds) return '-';
    return new Date(timestamp.seconds * 1000).toLocaleDateString('es-PE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const totalAmount = payments.reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);

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
          <View style={styles.dateInfo}>
            <Text>Fecha de Emisión:</Text>
            <Text>{new Date().toLocaleDateString('es-PE')}</Text>
          </View>
        </View>

        {/* TITLE */}
        <Text style={styles.title}>REPORTE DE PAGOS - ALUMNO</Text>

        {/* STUDENT INFO */}
        <View style={styles.studentInfo}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Alumno:</Text>
            <Text style={styles.infoValue}>{studentName}</Text>
          </View>
          {category && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Categoría:</Text>
              <Text style={styles.infoValue}>{category}</Text>
            </View>
          )}
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Total de Pagos:</Text>
            <Text style={styles.infoValue}>{payments.length}</Text>
          </View>
        </View>

        {/* TABLE */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={styles.col1}>#</Text>
            <Text style={styles.col2}>Concepto</Text>
            <Text style={styles.col3}>Fecha de Pago</Text>
            <Text style={styles.col4}>Estado</Text>
            <Text style={styles.col5}>Monto</Text>
          </View>

          {payments.map((payment, index) => (
            <View key={index} style={styles.tableRow}>
              <Text style={styles.col1}>{index + 1}</Text>
              <Text style={styles.col2}>{payment.month} {payment.year}</Text>
              <Text style={styles.col3}>{formatDate(payment.paymentDate)}</Text>
              <Text style={styles.col4}>{payment.status || 'Pagado'}</Text>
              <Text style={styles.col5}>S/. {payment.amount}</Text>
            </View>
          ))}
        </View>

        {/* SUMMARY */}
        <View style={styles.summary}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal:</Text>
            <Text style={styles.summaryValue}>S/. {totalAmount.toFixed(2)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>TOTAL PAGADO:</Text>
            <Text style={styles.totalValue}>S/. {totalAmount.toFixed(2)}</Text>
          </View>
        </View>

        {/* FOOTER */}
        <View style={styles.footer}>
          <Text>Reporte generado automáticamente por el sistema</Text>
          <Text style={{ marginTop: 3 }}>Escuela Deportiva Milan - Todos los derechos reservados</Text>
        </View>
      </Page>
    </Document>
  );
}
