package com.campuseats.service;

import com.campuseats.model.Payroll;
import com.lowagie.text.*;
import com.lowagie.text.pdf.*;
import org.springframework.stereotype.Service;

import java.awt.Color;
import java.io.ByteArrayOutputStream;

@Service
public class PayslipPdfService {

    private static final Font TITLE_FONT = new Font(Font.HELVETICA, 18, Font.BOLD, new Color(30, 30, 30));
    private static final Font SUBTITLE_FONT = new Font(Font.HELVETICA, 11, Font.NORMAL, new Color(100, 100, 100));
    private static final Font HEADER_FONT = new Font(Font.HELVETICA, 12, Font.BOLD, new Color(255, 255, 255));
    private static final Font LABEL_FONT = new Font(Font.HELVETICA, 10, Font.NORMAL, new Color(80, 80, 80));
    private static final Font VALUE_FONT = new Font(Font.HELVETICA, 10, Font.BOLD, new Color(30, 30, 30));
    private static final Font AMOUNT_FONT = new Font(Font.HELVETICA, 10, Font.NORMAL, new Color(30, 30, 30));
    private static final Font TOTAL_FONT = new Font(Font.HELVETICA, 12, Font.BOLD, new Color(0, 100, 50));
    private static final Font SMALL_FONT = new Font(Font.HELVETICA, 8, Font.NORMAL, new Color(130, 130, 130));

    private static final Color PRIMARY_COLOR = new Color(249, 115, 22); // Orange
    private static final Color HEADER_BG = new Color(30, 30, 30);
    private static final Color LIGHT_BG = new Color(248, 248, 248);
    private static final Color BORDER_COLOR = new Color(220, 220, 220);

    public byte[] generatePayslip(Payroll payroll, Payroll.PayrollItem item) {
        try {
            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            Document document = new Document(PageSize.A4, 40, 40, 40, 40);
            PdfWriter writer = PdfWriter.getInstance(document, baos);
            document.open();

            // ─── Header Section ───
            PdfPTable headerTable = new PdfPTable(2);
            headerTable.setWidthPercentage(100);
            headerTable.setWidths(new float[] { 60, 40 });

            // Company name
            PdfPCell companyCell = new PdfPCell();
            companyCell.setBorder(Rectangle.NO_BORDER);
            companyCell.setPadding(10);
            Paragraph company = new Paragraph("CampusEats", TITLE_FONT);
            companyCell.addElement(company);
            Paragraph canteenInfo = new Paragraph(
                    payroll.getCanteenName() != null ? payroll.getCanteenName() : "Canteen", SUBTITLE_FONT);
            companyCell.addElement(canteenInfo);
            headerTable.addCell(companyCell);

            // Payslip badge
            PdfPCell badgeCell = new PdfPCell();
            badgeCell.setBorder(Rectangle.NO_BORDER);
            badgeCell.setPadding(10);
            badgeCell.setHorizontalAlignment(Element.ALIGN_RIGHT);
            Paragraph badge = new Paragraph("PAYSLIP",
                    new Font(Font.HELVETICA, 14, Font.BOLD, PRIMARY_COLOR));
            badge.setAlignment(Element.ALIGN_RIGHT);
            badgeCell.addElement(badge);
            Paragraph period = new Paragraph("Period: " + payroll.getPeriodStart() +
                    " to " + payroll.getPeriodEnd(), SMALL_FONT);
            period.setAlignment(Element.ALIGN_RIGHT);
            badgeCell.addElement(period);
            Paragraph status = new Paragraph("Status: " + payroll.getStatus(), SMALL_FONT);
            status.setAlignment(Element.ALIGN_RIGHT);
            badgeCell.addElement(status);
            headerTable.addCell(badgeCell);

            document.add(headerTable);
            document.add(new Paragraph(" "));

            // ─── Divider ───
            PdfPTable divider = new PdfPTable(1);
            divider.setWidthPercentage(100);
            PdfPCell dividerCell = new PdfPCell();
            dividerCell.setBorder(Rectangle.BOTTOM);
            dividerCell.setBorderColor(PRIMARY_COLOR);
            dividerCell.setBorderWidth(2);
            dividerCell.setFixedHeight(2);
            divider.addCell(dividerCell);
            document.add(divider);
            document.add(new Paragraph(" "));

            // ─── Employee Info ───
            PdfPTable empTable = new PdfPTable(4);
            empTable.setWidthPercentage(100);
            empTable.setWidths(new float[] { 20, 30, 20, 30 });

            addInfoRow(empTable, "Employee Name", item.getStaffName());
            addInfoRow(empTable, "Role", item.getRole());
            addInfoRow(empTable, "Pay Type", item.getPayType());
            addInfoRow(empTable, "Pay Rate", "Rs. " + String.format("%.2f", item.getPayRate()));
            addInfoRow(empTable, "Days Worked", String.valueOf(item.getDaysWorked()));
            addInfoRow(empTable, "Days Absent", String.valueOf(item.getDaysAbsent()));
            addInfoRow(empTable, "Total Hours", String.format("%.1f hrs", item.getTotalHoursWorked()));
            addInfoRow(empTable, "Overtime Hours", String.format("%.1f hrs", item.getOvertimeHours()));

            document.add(empTable);
            document.add(new Paragraph(" "));

            // ─── Earnings Table ───
            document.add(new Paragraph("Earnings", new Font(Font.HELVETICA, 13, Font.BOLD, HEADER_BG)));
            document.add(new Paragraph(" "));

            PdfPTable earningsTable = new PdfPTable(2);
            earningsTable.setWidthPercentage(100);
            earningsTable.setWidths(new float[] { 70, 30 });

            addTableHeader(earningsTable, "Description", "Amount (LKR)");
            addTableRow(earningsTable, "Basic Pay", item.getBasicPay(), false);
            addTableRow(earningsTable, "Overtime Pay", item.getOvertimePay(), false);
            addTableRow(earningsTable, "Meal Allowance", item.getMealAllowance(), false);
            addTableRow(earningsTable, "Transport Allowance", item.getTransportAllowance(), false);
            addTableTotalRow(earningsTable, "Gross Pay", item.getGrossPay());

            document.add(earningsTable);
            document.add(new Paragraph(" "));

            // ─── Deductions Table ───
            document.add(new Paragraph("Deductions", new Font(Font.HELVETICA, 13, Font.BOLD, HEADER_BG)));
            document.add(new Paragraph(" "));

            PdfPTable deductionsTable = new PdfPTable(2);
            deductionsTable.setWidthPercentage(100);
            deductionsTable.setWidths(new float[] { 70, 30 });

            addTableHeader(deductionsTable, "Description", "Amount (LKR)");
            addTableRow(deductionsTable, "EPF (Employee Contribution)", item.getEpfEmployee(), false);
            addTableRow(deductionsTable, "Advance Deductions", item.getAdvanceDeductions(), false);
            addTableRow(deductionsTable, "Other Deductions", item.getOtherDeductions(), false);
            addTableTotalRow(deductionsTable, "Total Deductions", item.getTotalDeductions());

            document.add(deductionsTable);
            document.add(new Paragraph(" "));

            // ─── Net Pay ───
            PdfPTable netTable = new PdfPTable(2);
            netTable.setWidthPercentage(100);
            netTable.setWidths(new float[] { 70, 30 });

            PdfPCell netLabel = new PdfPCell(new Phrase("NET PAY",
                    new Font(Font.HELVETICA, 14, Font.BOLD, Color.WHITE)));
            netLabel.setBackgroundColor(new Color(16, 185, 129)); // Emerald
            netLabel.setPadding(12);
            netLabel.setBorder(Rectangle.NO_BORDER);
            netTable.addCell(netLabel);

            PdfPCell netValue = new PdfPCell(new Phrase("Rs. " + String.format("%.2f", item.getNetPay()),
                    new Font(Font.HELVETICA, 14, Font.BOLD, Color.WHITE)));
            netValue.setBackgroundColor(new Color(16, 185, 129));
            netValue.setPadding(12);
            netValue.setBorder(Rectangle.NO_BORDER);
            netValue.setHorizontalAlignment(Element.ALIGN_RIGHT);
            netTable.addCell(netValue);

            document.add(netTable);
            document.add(new Paragraph(" "));
            document.add(new Paragraph(" "));

            // ─── Employer Contributions (info only) ───
            PdfPTable empContribTable = new PdfPTable(2);
            empContribTable.setWidthPercentage(100);
            empContribTable.setWidths(new float[] { 70, 30 });

            PdfPCell contribHeader = new PdfPCell(new Phrase("Employer Contributions (For Reference)", SMALL_FONT));
            contribHeader.setColspan(2);
            contribHeader.setBorder(Rectangle.NO_BORDER);
            contribHeader.setPaddingBottom(8);
            empContribTable.addCell(contribHeader);

            addTableRow(empContribTable, "EPF (Employer Contribution)", item.getEpfEmployer(), true);
            addTableRow(empContribTable, "ETF (Employer Contribution)", item.getEtfEmployer(), true);

            document.add(empContribTable);
            document.add(new Paragraph(" "));
            document.add(new Paragraph(" "));

            // ─── Footer ───
            Paragraph footer = new Paragraph("This is a system-generated payslip from CampusEats. " +
                    "For any discrepancies, please contact your canteen owner.",
                    SMALL_FONT);
            footer.setAlignment(Element.ALIGN_CENTER);
            document.add(footer);

            document.close();
            return baos.toByteArray();

        } catch (Exception e) {
            throw new RuntimeException("Failed to generate payslip PDF: " + e.getMessage(), e);
        }
    }

    private void addInfoRow(PdfPTable table, String label, String value) {
        PdfPCell labelCell = new PdfPCell(new Phrase(label, LABEL_FONT));
        labelCell.setBorder(Rectangle.NO_BORDER);
        labelCell.setPadding(6);
        labelCell.setBackgroundColor(LIGHT_BG);
        table.addCell(labelCell);

        PdfPCell valueCell = new PdfPCell(new Phrase(value, VALUE_FONT));
        valueCell.setBorder(Rectangle.NO_BORDER);
        valueCell.setPadding(6);
        table.addCell(valueCell);
    }

    private void addTableHeader(PdfPTable table, String col1, String col2) {
        PdfPCell cell1 = new PdfPCell(new Phrase(col1, HEADER_FONT));
        cell1.setBackgroundColor(HEADER_BG);
        cell1.setPadding(10);
        cell1.setBorder(Rectangle.NO_BORDER);
        table.addCell(cell1);

        PdfPCell cell2 = new PdfPCell(new Phrase(col2, HEADER_FONT));
        cell2.setBackgroundColor(HEADER_BG);
        cell2.setPadding(10);
        cell2.setBorder(Rectangle.NO_BORDER);
        cell2.setHorizontalAlignment(Element.ALIGN_RIGHT);
        table.addCell(cell2);
    }

    private void addTableRow(PdfPTable table, String description, Double amount, boolean light) {
        PdfPCell descCell = new PdfPCell(new Phrase(description, LABEL_FONT));
        descCell.setPadding(8);
        descCell.setBorder(Rectangle.BOTTOM);
        descCell.setBorderColor(BORDER_COLOR);
        if (light)
            descCell.setBackgroundColor(LIGHT_BG);
        table.addCell(descCell);

        PdfPCell amtCell = new PdfPCell(new Phrase("Rs. " + String.format("%.2f", amount), AMOUNT_FONT));
        amtCell.setPadding(8);
        amtCell.setBorder(Rectangle.BOTTOM);
        amtCell.setBorderColor(BORDER_COLOR);
        amtCell.setHorizontalAlignment(Element.ALIGN_RIGHT);
        if (light)
            amtCell.setBackgroundColor(LIGHT_BG);
        table.addCell(amtCell);
    }

    private void addTableTotalRow(PdfPTable table, String description, Double amount) {
        PdfPCell descCell = new PdfPCell(new Phrase(description, VALUE_FONT));
        descCell.setPadding(10);
        descCell.setBorder(Rectangle.TOP);
        descCell.setBorderColor(HEADER_BG);
        descCell.setBorderWidth(1.5f);
        table.addCell(descCell);

        PdfPCell amtCell = new PdfPCell(new Phrase("Rs. " + String.format("%.2f", amount), TOTAL_FONT));
        amtCell.setPadding(10);
        amtCell.setBorder(Rectangle.TOP);
        amtCell.setBorderColor(HEADER_BG);
        amtCell.setBorderWidth(1.5f);
        amtCell.setHorizontalAlignment(Element.ALIGN_RIGHT);
        table.addCell(amtCell);
    }
}
