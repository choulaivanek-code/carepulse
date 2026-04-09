USE carepulse; SELECT id, numero_ticket, statut FROM tickets WHERE file_attente_id = 4 AND statut IN ('READY', 'WAITING', 'PRESENT', 'IN_PROGRESS');  
