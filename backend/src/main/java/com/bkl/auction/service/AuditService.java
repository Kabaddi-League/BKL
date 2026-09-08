package com.bkl.auction.service;

import com.bkl.auction.model.AuditLog;
import com.bkl.auction.model.Role;
import com.bkl.auction.model.User;
import com.bkl.auction.repository.AuditLogRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AuditService {

    private final AuditLogRepository auditLogRepository;

    public AuditService(AuditLogRepository auditLogRepository) {
        this.auditLogRepository = auditLogRepository;
    }

    public void logAction(User actor, String action, String target, String metadata) {
        Long actorId = actor != null ? actor.getId() : null;
        String actorName = actor != null ? actor.getFullName() : "SYSTEM";
        Role role = actor != null ? actor.getRole() : Role.SUPER_ADMIN;

        AuditLog log = new AuditLog(actorId, actorName, role, action, target, metadata);
        auditLogRepository.save(log);
    }

    public List<AuditLog> getAllAuditLogs() {
        return auditLogRepository.findAllByOrderByTimestampDesc();
    }
}
