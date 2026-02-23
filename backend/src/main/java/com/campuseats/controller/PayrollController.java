package com.campuseats.controller;

import com.campuseats.dto.CreatePayrollRequest;
import com.campuseats.dto.PayrollActionRequest;
import com.campuseats.dto.PayrollConfigRequest;
import com.campuseats.model.Payroll;
import com.campuseats.model.PayrollConfig;
import com.campuseats.service.PayrollService;
import com.campuseats.service.PayslipPdfService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/payroll")
@RequiredArgsConstructor
public class PayrollController {

    private final PayrollService payrollService;
    private final PayslipPdfService payslipPdfService;

    // ───── Configuration ─────

    @GetMapping("/config")
    public ResponseEntity<?> getConfig() {
        try {
            PayrollConfig config = payrollService.getConfig();
            return ResponseEntity.ok(config);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error: " + e.getMessage());
        }
    }

    @PutMapping("/config")
    public ResponseEntity<?> updateConfig(@RequestBody PayrollConfigRequest request,
            @RequestParam(required = false) String adminId) {
        try {
            PayrollConfig config = payrollService.updateConfig(request, adminId);
            return ResponseEntity.ok(config);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error: " + e.getMessage());
        }
    }

    // ───── Payroll Generation ─────

    @PostMapping("/generate")
    public ResponseEntity<?> generatePayroll(@RequestBody CreatePayrollRequest request) {
        try {
            Payroll payroll = payrollService.generatePayroll(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(payroll);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Error: " + e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error: " + e.getMessage());
        }
    }

    // ───── Status Workflow ─────

    @PutMapping("/{id}/submit")
    public ResponseEntity<?> submitPayroll(@PathVariable String id,
            @RequestBody(required = false) PayrollActionRequest request,
            @RequestParam(required = false) String submittedBy) {
        try {
            Payroll payroll = payrollService.submitPayroll(id, submittedBy, request);
            return ResponseEntity.ok(payroll);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Error: " + e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error: " + e.getMessage());
        }
    }

    @PutMapping("/{id}/approve")
    public ResponseEntity<?> approvePayroll(@PathVariable String id,
            @RequestBody(required = false) PayrollActionRequest request,
            @RequestParam(required = false) String reviewedBy) {
        try {
            Payroll payroll = payrollService.approvePayroll(id, reviewedBy, request);
            return ResponseEntity.ok(payroll);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Error: " + e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error: " + e.getMessage());
        }
    }

    @PutMapping("/{id}/reject")
    public ResponseEntity<?> rejectPayroll(@PathVariable String id,
            @RequestBody(required = false) PayrollActionRequest request,
            @RequestParam(required = false) String reviewedBy) {
        try {
            Payroll payroll = payrollService.rejectPayroll(id, reviewedBy, request);
            return ResponseEntity.ok(payroll);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Error: " + e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error: " + e.getMessage());
        }
    }

    // ───── Queries ─────

    @GetMapping("/{id}")
    public ResponseEntity<?> getPayrollById(@PathVariable String id) {
        try {
            Payroll payroll = payrollService.getPayrollById(id);
            return ResponseEntity.ok(payroll);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Error: " + e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error: " + e.getMessage());
        }
    }

    @GetMapping("/canteen/{canteenId}")
    public ResponseEntity<?> getPayrollsByCanteen(@PathVariable String canteenId) {
        try {
            List<Payroll> payrolls = payrollService.getPayrollsByCanteen(canteenId);
            return ResponseEntity.ok(payrolls);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error: " + e.getMessage());
        }
    }

    @GetMapping("/pending")
    public ResponseEntity<?> getPendingPayrolls() {
        try {
            List<Payroll> payrolls = payrollService.getPendingPayrolls();
            return ResponseEntity.ok(payrolls);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error: " + e.getMessage());
        }
    }

    @GetMapping("/pending/count")
    public ResponseEntity<?> getPendingCount() {
        try {
            long count = payrollService.getPendingCount();
            return ResponseEntity.ok(Map.of("count", count));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error: " + e.getMessage());
        }
    }

    @GetMapping("/all")
    public ResponseEntity<?> getAllPayrolls() {
        try {
            List<Payroll> payrolls = payrollService.getAllPayrolls();
            return ResponseEntity.ok(payrolls);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error: " + e.getMessage());
        }
    }

    // ───── PDF Payslip Download ─────

    @GetMapping("/{payrollId}/payslip/{staffId}/pdf")
    public ResponseEntity<?> downloadPayslipPdf(@PathVariable String payrollId,
            @PathVariable String staffId) {
        try {
            Payroll payroll = payrollService.getPayrollById(payrollId);

            // Find the staff item
            Payroll.PayrollItem item = payroll.getItems().stream()
                    .filter(i -> i.getStaffId().equals(staffId))
                    .findFirst()
                    .orElseThrow(() -> new RuntimeException("Staff payroll item not found"));

            byte[] pdf = payslipPdfService.generatePayslip(payroll, item);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentDispositionFormData("attachment",
                    "payslip_" + item.getStaffName().replaceAll("\\s+", "_") +
                            "_" + payroll.getPeriodStart() + "_" + payroll.getPeriodEnd() + ".pdf");

            return new ResponseEntity<>(pdf, headers, HttpStatus.OK);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Error: " + e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error: " + e.getMessage());
        }
    }
}
