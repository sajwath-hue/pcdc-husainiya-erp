import { StyleSheet } from "@react-pdf/renderer";

export const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 10, fontFamily: "Helvetica", color: "#1a1a1a" },
  headerCenter: { textAlign: "center", marginBottom: 16 },
  orgNameTamil: { fontSize: 16, fontWeight: 700, marginBottom: 2 },
  orgNameEnglish: { fontSize: 11, color: "#444", marginBottom: 2 },
  orgAddress: { fontSize: 9, color: "#555" },
  divider: { borderBottomWidth: 1, borderBottomColor: "#333", marginVertical: 10 },
  title: { fontSize: 13, fontWeight: 700, textAlign: "center", marginVertical: 10 },
  titleSub: { fontSize: 9, textAlign: "center", color: "#555", marginBottom: 10 },
  metaRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 10 },
  sectionTitle: { fontSize: 11, fontWeight: 700, marginTop: 14, marginBottom: 6 },
  sectionTitleSub: { fontSize: 8, color: "#666", marginBottom: 6 },
  row: { flexDirection: "row", marginBottom: 4 },
  labelCol: { width: "40%" },
  labelTamil: { fontSize: 9, fontWeight: 700 },
  labelEnglish: { fontSize: 8, color: "#555" },
  valueCol: { width: "60%", fontSize: 10 },
  paragraph: { fontSize: 9.5, lineHeight: 1.5, marginBottom: 8 },
  table: { marginTop: 6, borderWidth: 1, borderColor: "#333" },
  tableRow: { flexDirection: "row" },
  tableHeaderCell: {
    flex: 1,
    borderRightWidth: 1,
    borderRightColor: "#333",
    borderBottomWidth: 1,
    borderBottomColor: "#333",
    padding: 4,
    fontSize: 8,
    fontWeight: 700,
    backgroundColor: "#eee",
  },
  tableCell: {
    flex: 1,
    borderRightWidth: 1,
    borderRightColor: "#333",
    borderBottomWidth: 1,
    borderBottomColor: "#333",
    padding: 4,
    fontSize: 8.5,
  },
  signatureBlock: { marginTop: 40, flexDirection: "row", justifyContent: "space-between" },
  signatureBox: { width: "45%", borderTopWidth: 1, borderTopColor: "#333", paddingTop: 4, fontSize: 8 },
  sealBox: {
    marginTop: 30,
    width: 110,
    height: 90,
    borderWidth: 1,
    borderColor: "#999",
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
  },
  sealText: { fontSize: 7, color: "#888", textAlign: "center" },
  footer: { position: "absolute", bottom: 24, left: 40, right: 40, fontSize: 7, color: "#888", textAlign: "center" },
});

export function fmtCurrency(n: number): string {
  return `Rs. ${n.toLocaleString("en-LK", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function fmtDate(d: Date | string | null | undefined): string {
  if (!d) return "-";
  const date = typeof d === "string" ? new Date(d) : d;
  return date.toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" });
}
