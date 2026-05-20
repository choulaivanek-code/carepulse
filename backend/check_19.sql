USE carepulse; 
SELECT * FROM tickets WHERE id = 19;
SELECT m.*, u.nom FROM medecins m JOIN users u ON m.user_id = u.id WHERE m.id = (SELECT medecin_id FROM tickets WHERE id = 19);
