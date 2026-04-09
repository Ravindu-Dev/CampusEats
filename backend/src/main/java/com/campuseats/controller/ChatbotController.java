package com.campuseats.controller;

import com.campuseats.service.ChatbotService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/chatbot")
@RequiredArgsConstructor
public class ChatbotController {

    private final ChatbotService chatbotService;

    @PostMapping("/query")
    public ResponseEntity<?> processQuery(@RequestBody Map<String, Object> request) {
        String message = (String) request.get("message");
        if (message == null || message.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of(
                    "reply", "Please type a message! 🍔",
                    "data", java.util.Collections.emptyList()));
        }

        // Extract conversation history for multi-turn context
        @SuppressWarnings("unchecked")
        List<Map<String, String>> history = (List<Map<String, String>>) request.get("history");

        try {
            Map<String, Object> response = chatbotService.processQuery(message, history);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of(
                    "reply", "Oops! Something went wrong. Please try again! 🍔",
                    "data", java.util.Collections.emptyList()));
        }
    }
}
