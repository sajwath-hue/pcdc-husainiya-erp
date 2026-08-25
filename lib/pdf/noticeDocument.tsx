import { Document, Page, Text, View, renderToBuffer } from "@react-pdf/renderer";
import { styles, fmtCurrency, fmtDate } from "./shared";
import type { NoticeType } from "@/lib/loan/constants";

export interface NoticeDocumentData {
  orgName: string;
  orgNameTamil: string;
  orgAddress: string;
  noticeNumber: string;
  noticeType: NoticeType;
  noticeDate: Date;
  borrowerName: string;
  nic: string;
  address: string;
  contactNumber: string;
  loanReferenceNumber: string;
  approvedAmount: number;
  disbursedAmount: number | null;
  monthlyInstalment: number;
  dueDate: Date;
  missedInstalmentAmount: number;
  outstandingAmount: number;
  daysOverdue: number;
}

const NOTICE_TITLE: Record<NoticeType, { ta: string; en: string }> = {
  PAYMENT_REMINDER: { ta: "கட்டண நினைவூட்டல் அறிவிப்பு", en: "PAYMENT REMINDER NOTICE" },
  SECOND_REMINDER: { ta: "இரண்டாம் நினைவூட்டல் அறிவிப்பு", en: "SECOND REMINDER NOTICE" },
  FINAL_NOTICE: { ta: "இறுதி அறிவிப்பு", en: "FINAL NOTICE" },
};

function Field({ ta, en, value }: { ta: string; en: string; value: string }) {
  return (
    <View style={styles.row}>
      <View style={styles.labelCol}>
        <Text style={styles.labelTamil}>{ta}</Text>
        <Text style={styles.labelEnglish}>{en}</Text>
      </View>
      <Text style={styles.valueCol}>{value}</Text>
    </View>
  );
}

function NoticeDoc({ data }: { data: NoticeDocumentData }) {
  const title = NOTICE_TITLE[data.noticeType];
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.headerCenter}>
          <Text style={styles.orgNameTamil}>{data.orgNameTamil}</Text>
          <Text style={styles.orgNameEnglish}>{data.orgName}</Text>
          <Text style={styles.orgAddress}>{data.orgAddress}</Text>
        </View>
        <View style={styles.divider} />

        <Text style={styles.title}>{title.ta}</Text>
        <Text style={styles.titleSub}>{title.en}</Text>

        <View style={styles.metaRow}>
          <Text>அறிவிப்பு எண் / Notice No: {data.noticeNumber}</Text>
          <Text>தேதி / Date: {fmtDate(data.noticeDate)}</Text>
        </View>

        <Text style={styles.sectionTitle}>கடன் பெறுநர் விவரங்கள்</Text>
        <Text style={styles.sectionTitleSub}>Borrower Details</Text>
        <Field ta="பெயர்" en="Name" value={data.borrowerName} />
        <Field ta="தேசிய அடையாள அட்டை எண்" en="NIC" value={data.nic} />
        <Field ta="முகவரி" en="Address" value={data.address} />
        <Field ta="தொடர்பு எண்" en="Contact Number" value={data.contactNumber} />

        <Text style={styles.sectionTitle}>கடன் விவரங்கள்</Text>
        <Text style={styles.sectionTitleSub}>Loan Details</Text>
        <Field ta="கடன் குறிப்பு எண்" en="Loan Reference Number" value={data.loanReferenceNumber} />
        <Field ta="அங்கீகரிக்கப்பட்ட தொகை" en="Approved Amount" value={fmtCurrency(data.approvedAmount)} />
        <Field
          ta="வழங்கப்பட்ட தொகை"
          en="Disbursed Amount"
          value={data.disbursedAmount != null ? fmtCurrency(data.disbursedAmount) : "-"}
        />
        <Field ta="மாதாந்திர தவணை" en="Monthly Instalment" value={fmtCurrency(data.monthlyInstalment)} />
        <Field ta="செலுத்த வேண்டிய தேதி" en="Due Date" value={fmtDate(data.dueDate)} />
        <Field ta="செலுத்தப்படாத தவணை" en="Missed Instalment" value={fmtCurrency(data.missedInstalmentAmount)} />
        <Field ta="நிலுவைத் தொகை" en="Outstanding Amount" value={fmtCurrency(data.outstandingAmount)} />
        <Field ta="தாமதமான நாட்கள்" en="Days Overdue" value={String(data.daysOverdue)} />

        <Text style={styles.sectionTitle}>அறிவிப்பு உரை</Text>
        <Text style={styles.sectionTitleSub}>Notice</Text>
        <Text style={styles.paragraph}>
          PCDC பராமரிக்கும் பதிவுகளின்படி, மேலே குறிப்பிடப்பட்ட மாதாந்திர கடன் தவணை நிர்ணயிக்கப்பட்ட காலத்திற்குள்
          பெறப்படவில்லை.
        </Text>
        <Text style={styles.paragraph}>
          According to the records maintained by PCDC, the above-mentioned monthly repayment has not been received
          within the scheduled repayment period.
        </Text>
        <Text style={styles.paragraph}>
          நீங்கள் PCDC-ஐ தொடர்பு கொண்டு நிலுவைத் தவணையை செலுத்தும்படி அல்லது கட்டணம் செலுத்துவதில் ஏதேனும்
          சிரமம் இருந்தால் பொறுப்பு அதிகாரியிடம் தொடர்பு கொள்ளும்படி பணிவுடன் கேட்டுக் கொள்ளப்படுகிறீர்கள்.
        </Text>
        <Text style={styles.paragraph}>
          You are kindly requested to contact PCDC and settle the outstanding instalment or communicate with the
          responsible officer regarding any difficulty in making the payment.
        </Text>
        <Text style={styles.paragraph}>
          இந்த அறிவிப்பு ஒரு கட்டண நினைவூட்டலாகவும், நிறுவன பதிவுகளை துல்லியமாக பராமரிப்பதற்காகவும் வழங்கப்படுகிறது.
        </Text>
        <Text style={styles.paragraph}>
          This notice is issued as a payment reminder and for maintaining accurate institutional records.
        </Text>

        <View style={styles.signatureBlock}>
          <View style={styles.signatureBox}>
            <Text>அங்கீகரிக்கப்பட்ட அதிகாரி கையொப்பம்</Text>
            <Text>Authorized Officer Signature</Text>
          </View>
          <View style={styles.sealBox}>
            <Text style={styles.sealText}>அதிகாரப்பூர்வ முத்திரை{"\n"}Official Seal / Stamp</Text>
          </View>
        </View>

        <Text style={styles.footer}>
          This document was system-generated by the PCDC Husainiya ERP Loan Management module on {fmtDate(new Date())}.
        </Text>
      </Page>
    </Document>
  );
}

export async function renderNoticePdf(data: NoticeDocumentData): Promise<Buffer> {
  return renderToBuffer(<NoticeDoc data={data} />);
}
