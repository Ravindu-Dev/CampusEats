package com.campuseats.service;

import com.campuseats.dto.AttendanceRequest;
import com.campuseats.dto.AttendanceResponse;
import com.campuseats.model.Attendance;
import com.campuseats.model.Staff;
import com.campuseats.repository.AttendanceRepository;
import com.campuseats.repository.StaffRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AttendanceService {

    private final AttendanceRepository attendanceRepository;
    private final StaffRepository staffRepository;

    private static final double STANDARD_HOURS_PER_DAY = 8.0;

    public AttendanceResponse logAttendance(AttendanceRequest request) {
        LocalDate date = LocalDate.parse(request.getDate());

        // Check for duplicate
        Optional<Attendance> existing = attendanceRepository.findByStaffIdAndDate(
                request.getStaffId(), date);
        if (existing.isPresent()) {
            // Update existing record
            Attendance att = existing.get();
            updateAttendanceFields(att, request.getCheckInTime(), request.getCheckOutTime(),
                    request.getDayType(), request.getNotes());
            Attendance saved = attendanceRepository.save(att);
            return convertToResponse(saved);
        }

        // Create new attendance
        Attendance attendance = new Attendance();
        attendance.setStaffId(request.getStaffId());
        attendance.setCanteenId(request.getCanteenId());
        attendance.setDate(date);
        updateAttendanceFields(attendance, request.getCheckInTime(), request.getCheckOutTime(),
                request.getDayType(), request.getNotes());

        Attendance saved = attendanceRepository.save(attendance);
        return convertToResponse(saved);
    }

    public List<AttendanceResponse> logBulkAttendance(AttendanceRequest.BulkAttendanceRequest request) {
        LocalDate date = LocalDate.parse(request.getDate());
        List<AttendanceResponse> results = new ArrayList<>();

        for (AttendanceRequest.AttendanceEntry entry : request.getEntries()) {
            Optional<Attendance> existing = attendanceRepository.findByStaffIdAndDate(
                    entry.getStaffId(), date);

            Attendance attendance;
            if (existing.isPresent()) {
                attendance = existing.get();
            } else {
                attendance = new Attendance();
                attendance.setStaffId(entry.getStaffId());
                attendance.setCanteenId(request.getCanteenId());
                attendance.setDate(date);
            }

            updateAttendanceFields(attendance, entry.getCheckInTime(), entry.getCheckOutTime(),
                    entry.getDayType(), entry.getNotes());

            Attendance saved = attendanceRepository.save(attendance);
            results.add(convertToResponse(saved));
        }

        return results;
    }

    public List<AttendanceResponse> getAttendanceByCanteen(String canteenId, String startDate, String endDate) {
        LocalDate start = LocalDate.parse(startDate);
        LocalDate end = LocalDate.parse(endDate);
        return attendanceRepository.findByCanteenIdAndDateBetween(canteenId, start, end).stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    public List<AttendanceResponse> getAttendanceByStaff(String staffId, String startDate, String endDate) {
        LocalDate start = LocalDate.parse(startDate);
        LocalDate end = LocalDate.parse(endDate);
        return attendanceRepository.findByStaffIdAndDateBetween(staffId, start, end).stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    public List<AttendanceResponse> getAttendanceByCanteenAndDate(String canteenId, String date) {
        LocalDate d = LocalDate.parse(date);
        return attendanceRepository.findByCanteenIdAndDate(canteenId, d).stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    private void updateAttendanceFields(Attendance att, String checkIn, String checkOut,
            String dayType, String notes) {
        att.setDayType(dayType != null ? dayType : "PRESENT");
        att.setNotes(notes);

        if ("ABSENT".equals(dayType) || "LEAVE".equals(dayType)) {
            att.setCheckInTime(null);
            att.setCheckOutTime(null);
            att.setTotalHours(0.0);
            att.setOvertimeHours(0.0);
        } else if ("HALF_DAY".equals(dayType)) {
            att.setCheckInTime(checkIn);
            att.setCheckOutTime(checkOut);
            double hours = calculateHours(checkIn, checkOut);
            att.setTotalHours(Math.min(hours, STANDARD_HOURS_PER_DAY / 2));
            att.setOvertimeHours(0.0);
        } else {
            att.setCheckInTime(checkIn);
            att.setCheckOutTime(checkOut);
            double hours = calculateHours(checkIn, checkOut);
            att.setTotalHours(hours);
            att.setOvertimeHours(Math.max(0, hours - STANDARD_HOURS_PER_DAY));
        }
    }

    private double calculateHours(String checkIn, String checkOut) {
        if (checkIn == null || checkOut == null || checkIn.isEmpty() || checkOut.isEmpty()) {
            return 0.0;
        }
        try {
            LocalTime in = LocalTime.parse(checkIn);
            LocalTime out = LocalTime.parse(checkOut);
            Duration duration = Duration.between(in, out);
            double hours = duration.toMinutes() / 60.0;
            return Math.max(0, Math.round(hours * 100.0) / 100.0);
        } catch (Exception e) {
            return 0.0;
        }
    }

    private AttendanceResponse convertToResponse(Attendance attendance) {
        String staffName = "";
        try {
            Staff staff = staffRepository.findById(attendance.getStaffId()).orElse(null);
            if (staff != null) {
                staffName = staff.getStaffName();
            }
        } catch (Exception ignored) {
        }

        return new AttendanceResponse(
                attendance.getId(),
                attendance.getStaffId(),
                staffName,
                attendance.getCanteenId(),
                attendance.getDate(),
                attendance.getCheckInTime(),
                attendance.getCheckOutTime(),
                attendance.getTotalHours(),
                attendance.getOvertimeHours(),
                attendance.getDayType(),
                attendance.getNotes(),
                attendance.getCreatedAt());
    }
}
