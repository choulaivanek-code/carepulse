package com.carepulse.carepulse.enums.converter;

import com.carepulse.carepulse.enums.PriorityType;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter(autoApply = true)
public class PriorityTypeConverter implements AttributeConverter<PriorityType, String> {

    @Override
    public String convertToDatabaseColumn(PriorityType priority) {
        if (priority == null) {
            return null;
        }
        return priority.name();
    }

    @Override
    public PriorityType convertToEntityAttribute(String dbData) {
        if (dbData == null || dbData.trim().isEmpty()) {
            return null;
        }
        
        switch (dbData) {
            case "NORMALE": return PriorityType.NORMAL;
            case "MODEREE": return PriorityType.MODERATE;
            case "URGENTE": return PriorityType.HIGH;
            case "CRITIQUE": return PriorityType.URGENT;
        }

        try {
            return PriorityType.valueOf(dbData);
        } catch (IllegalArgumentException e) {
            return PriorityType.NORMAL;
        }
    }
}
