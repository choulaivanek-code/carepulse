USE carepulse; SELECT * FROM consultations WHERE id = 4; SELECT * FROM tickets WHERE id = (SELECT ticket_id FROM consultations WHERE id = 4);  
