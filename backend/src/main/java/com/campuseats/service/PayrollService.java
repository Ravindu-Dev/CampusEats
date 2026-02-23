package com.campuseats.service;

import com.campuseats.dto.CreatePayrollRequest;
import com.campuseats.dto.PayrollActionRequest;
import com.campuseats.dto.PayrollConfigRequest;
import com.campuseats.model.Attendance;
import com.campuseats.model.Payroll;
import com.campuseats.model.PayrollConfig;
import com.campuseats.model.Staff;
import com.campuseats.model.Canteen;
import com.campuseats.repository.AttendanceRepository;
import com.campuseats.repository.PayrollConfigRepository;
import com.campuseats.repository.PayrollRepository;
import com.campuseats.repository.StaffRepository;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class PayrollService {

    private final PayrollRepository payrollRepository;
    private final PayrollConfigRepository payrollConfigRepository;
    private final StaffRepository staffRepository;
    private final AttendanceRepository attendanceRepository;
    private final CanteenService canteenService;

    // ───── Configuration ─────

    public PayrollConfig getConfig() {
        List<PayrollConfig> configs = payrollConfigRepository.findAll();
        if (configs.isEmpty()) {
            // Create default config
            PayrollConfig defaultConfig = new PayrollConfig();
            return payrollConfigRepository.save(defaultConfig);
        }
        return configs.get(0);
    }

    public PayrollConfig updateConfig(PayrollConfigRequest request, String adminId) {
        PayrollConfig config = getConfig();

        if (request.getPayPeriodType() != null)
            config.setPayPeriodType(request.getPayPeriodType());
        if (request.getOvertimeMultiplier() != null)
            config.setOvertimeMultiplier(request.getOvertimeMultiplier());
        if (request.getEpfEmployeeRate() != null)
            config.setEpfEmployeeRate(request.getEpfEmployeeRate());
        if (request.getEpfEmployerRate() != null)
            config.setEpfEmployerRate(request.getEpfEmployerRate());
        if (request.getEtfRate() != null)
            config.setEtfRate(request.getEtfRate());
        if (request.getStandardWorkHoursPerDay() != null)
            config.setStandardWorkHoursPerDay(request.getStandardWorkHoursPerDay());
        if (request.getDefaultMealAllowance() != null)
            config.setDefaultMealAllowance(request.getDefaultMealAllowance());
        if (request.getDefaultTransportAllowance() != null)
            config.setDefaultTransportAllowance(request.getDefaultTransportAllowance());
        config.setUpdatedBy(adminId);

        return payrollConfigRepository.save(config);
    }

    // ───── Payroll Generation ─────

    public Payroll generatePayroll(CreatePayrollRequest request) {
        // Check for existing payroll for this period
        Optional<Payroll> existing = payrollRepository.findByCanteenIdAndPeriodStartAndPeriodEnd(
                request.getCanteenId(), request.getPeriodStart(), request.getPeriodEnd());

        if (existing.isPresent() && !"REJECTED".equals(existing.get().getStatus())) {
            throw new RuntimeException(
                    "A payroll already exists for this period. Status: " + existing.get().getStatus());
        }

        PayrollConfig config = getConfig();
        LocalDate periodStart = LocalDate.parse(request.getPeriodStart());
        LocalDate periodEnd = LocalDate.parse(request.getPeriodEnd());

        // Get canteen name
        String canteenName = "";
        try {
            Canteen canteen = canteenService.getCanteenById(request.getCanteenId());
            canteenName = canteen.getCanteenName();
        } catch (Exception ignored) {
        }

        // Get active staff for canteen
        List<Staff> staffList = staffRepository.findByCanteenIdAndStatus(request.getCanteenId(), "ACTIVE");

        if (staffList.isEmpty()) {
            throw new RuntimeException("No active staff members found for this canteen");
        }

        // Calculate for each staff member
        List<Payroll.PayrollItem> items = new ArrayList<>();
        double totalGross = 0, totalDeductions = 0, totalNet = 0;
        double totalEpfEmployer = 0, totalEtfEmployer = 0;

        for (Staff staff : staffList) {
            Payroll.PayrollItem item = calculateStaffPayroll(staff, periodStart, periodEnd, config);
            items.add(item);
            totalGross += item.getGrossPay();
            totalDeductions += item.getTotalDeductions();
            totalNet += item.getNetPay();
            totalEpfEmployer += item.getEpfEmployer();
            totalEtfEmployer += item.getEtfEmployer();
        }

        // Create payroll
        Payroll payroll;
        if (existing.isPresent()) {
            // Regenerate over a rejected payroll
            payroll = existing.get();
            payroll.setStatus("DRAFT");
            payroll.setReviewedBy(null);
            payroll.setReviewedAt(null);
            payroll.setReviewComments(null);
        } else {
            payroll = new Payroll();
        }

        payroll.setCanteenId(request.getCanteenId());
        payroll.setCanteenName(canteenName);
        payroll.setPeriodStart(request.getPeriodStart());
        payroll.setPeriodEnd(request.getPeriodEnd());
        payroll.setPeriodType(config.getPayPeriodType());
        payroll.setItems(items);
        payroll.setTotalGrossPay(Math.round(totalGross * 100.0) / 100.0);
        payroll.setTotalDeductions(Math.round(totalDeductions * 100.0) / 100.0);
        payroll.setTotalNetPay(Math.round(totalNet * 100.0) / 100.0);
        payroll.setTotalEpfEmployer(Math.round(totalEpfEmployer * 100.0) / 100.0);
        payroll.setTotalEtfEmployer(Math.round(totalEtfEmployer * 100.0) / 100.0);
        payroll.setTotalStaffCount(items.size());

        return payrollRepository.save(payroll);
    }

    private Payroll.PayrollItem calculateStaffPayroll(Staff staff, LocalDate periodStart,
            LocalDate periodEnd, PayrollConfig config) {
        // Get attendance records
        List<Attendance> attendanceRecords = attendanceRepository.findByStaffIdAndDateBetween(
                staff.getId(), periodStart, periodEnd);

        double totalHours = 0, overtimeHours = 0;
        int daysWorked = 0, daysAbsent = 0;

        for (Attendance att : attendanceRecords) {
            if ("PRESENT".equals(att.getDayType()) || "HALF_DAY".equals(att.getDayType())) {
                daysWorked++;
                totalHours += (att.getTotalHours() != null ? att.getTotalHours() : 0);
                overtimeHours += (att.getOvertimeHours() != null ? att.getOvertimeHours() : 0);
            } else {
                daysAbsent++;
            }
        }

        // Calculate basic pay
        double basicPay;
        if ("HOURLY".equals(staff.getPayType())) {
            basicPay = (totalHours - overtimeHours) * staff.getPayRate();
        } else {
            // Monthly salary — pro-rate based on days worked
            double dailyRate = staff.getPayRate() / 30.0; // Standard 30-day month
            basicPay = dailyRate * daysWorked;
        }

        // Overtime pay
        double overtimePay = overtimeHours * staff.getPayRate() * config.getOvertimeMultiplier();

        // Allowances (per days worked)
        double mealAllowance = config.getDefaultMealAllowance() * daysWorked;
        double transportAllowance = config.getDefaultTransportAllowance() * daysWorked;

        // Gross pay
        double grossPay = basicPay + overtimePay + mealAllowance + transportAllowance;

        // Deductions
        double epfEmployee = grossPay * (config.getEpfEmployeeRate() / 100.0);

        // Employer contributions (not deducted from employee)
        double epfEmployer = grossPay * (config.getEpfEmployerRate() / 100.0);
        double etfEmployer = grossPay * (config.getEtfRate() / 100.0);

        double totalDeductionsAmount = epfEmployee; // Can add advance/other deductions later
        double netPay = grossPay - totalDeductionsAmount;

        Payroll.PayrollItem item = new Payroll.PayrollItem();
        item.setStaffId(staff.getId());
        item.setStaffName(staff.getStaffName());
        item.setRole(staff.getRole());
        item.setPayType(staff.getPayType());
        item.setPayRate(staff.getPayRate());
        item.setTotalHoursWorked(Math.round(totalHours * 100.0) / 100.0);
        item.setOvertimeHours(Math.round(overtimeHours * 100.0) / 100.0);
        item.setDaysWorked(daysWorked);
        item.setDaysAbsent(daysAbsent);
        item.setBasicPay(Math.round(basicPay * 100.0) / 100.0);
        item.setOvertimePay(Math.round(overtimePay * 100.0) / 100.0);
        item.setMealAllowance(Math.round(mealAllowance * 100.0) / 100.0);
        item.setTransportAllowance(Math.round(transportAllowance * 100.0) / 100.0);
        item.setGrossPay(Math.round(grossPay * 100.0) / 100.0);
        item.setEpfEmployee(Math.round(epfEmployee * 100.0) / 100.0);
        item.setAdvanceDeductions(0.0);
        item.setOtherDeductions(0.0);
        item.setTotalDeductions(Math.round(totalDeductionsAmount * 100.0) / 100.0);
        item.setNetPay(Math.round(netPay * 100.0) / 100.0);
        item.setEpfEmployer(Math.round(epfEmployer * 100.0) / 100.0);
        item.setEtfEmployer(Math.round(etfEmployer * 100.0) / 100.0);

        return item;
    }

    // ───── Status Workflow ─────

    public Payroll submitPayroll(String payrollId, String submittedBy, PayrollActionRequest request) {
        Payroll payroll = getPayrollById(payrollId);
        if (!"DRAFT".equals(payroll.getStatus())) {
            throw new RuntimeException("Can only submit payrolls in DRAFT status. Current: " + payroll.getStatus());
        }
        payroll.setStatus("SUBMITTED");
        payroll.setSubmittedBy(submittedBy);
        payroll.setSubmittedAt(LocalDateTime.now());
        payroll.setSubmissionNotes(request != null ? request.getNotes() : null);
        return payrollRepository.save(payroll);
    }

    public Payroll approvePayroll(String payrollId, String reviewedBy, PayrollActionRequest request) {
        Payroll payroll = getPayrollById(payrollId);
        if (!"SUBMITTED".equals(payroll.getStatus()) && !"UNDER_REVIEW".equals(payroll.getStatus())) {
            throw new RuntimeException(
                    "Can only approve SUBMITTED or UNDER_REVIEW payrolls. Current: " + payroll.getStatus());
        }
        payroll.setStatus("APPROVED");
        payroll.setReviewedBy(reviewedBy);
        payroll.setReviewedAt(LocalDateTime.now());
        payroll.setReviewComments(request != null ? request.getComments() : null);
        return payrollRepository.save(payroll);
    }

    public Payroll rejectPayroll(String payrollId, String reviewedBy, PayrollActionRequest request) {
        Payroll payroll = getPayrollById(payrollId);
        if (!"SUBMITTED".equals(payroll.getStatus()) && !"UNDER_REVIEW".equals(payroll.getStatus())) {
            throw new RuntimeException(
                    "Can only reject SUBMITTED or UNDER_REVIEW payrolls. Current: " + payroll.getStatus());
        }
        payroll.setStatus("REJECTED");
        payroll.setReviewedBy(reviewedBy);
        payroll.setReviewedAt(LocalDateTime.now());
        payroll.setReviewComments(request != null ? request.getComments() : "No reason provided");
        return payrollRepository.save(payroll);
    }

    // ───── Queries ─────

    public Payroll getPayrollById(String id) {
        return payrollRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Payroll not found"));
    }

    public List<Payroll> getPayrollsByCanteen(String canteenId) {
        return payrollRepository.findByCanteenIdOrderByCreatedAtDesc(canteenId);
    }

    public List<Payroll> getPendingPayrolls() {
        return payrollRepository.findByStatusIn(List.of("SUBMITTED", "UNDER_REVIEW"));
    }

    public List<Payroll> getAllPayrolls() {
        return payrollRepository.findAll();
    }

    public long getPendingCount() {
        return payrollRepository.countByStatus("SUBMITTED") + payrollRepository.countByStatus("UNDER_REVIEW");
    }
}
