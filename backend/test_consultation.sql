USE carepulse;
SELECT id, ticket_id, date_debut, date_fin FROM consultations WHERE id = 4;
SELECT id, statut, heure_debut FROM tickets WHERE id = (SELECT ticket_id FROM consultations WHERE id = 4);
