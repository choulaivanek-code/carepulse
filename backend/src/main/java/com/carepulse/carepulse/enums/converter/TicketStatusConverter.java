package com.carepulse.carepulse.enums.converter;

import com.carepulse.carepulse.enums.TicketStatus;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter(autoApply = true)
public class TicketStatusConverter implements AttributeConverter<TicketStatus, String> {

    @Override
    public String convertToDatabaseColumn(TicketStatus status) {
        if (status == null) {
            return null;
        }
        return status.name();
    }

    @Override
    public TicketStatus convertToEntityAttribute(String dbData) {
        if (dbData == null || dbData.trim().isEmpty()) {
            return null;
        }
        try {
            return TicketStatus.valueOf(dbData);
        } catch (IllegalArgumentException e) {
            return null;
        }
    }
}
