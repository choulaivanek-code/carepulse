import java.sql.*;

public class CheckTicket19 {
    public static void main(String[] args) {
        String url = "jdbc:mariadb://localhost:3306/carepulse";
        String user = "root";
        String password = "";
        try (Connection conn = DriverManager.getConnection(url, user, password)) {
            System.out.println("Checking Ticket 19...");
            PreparedStatement pstmt = conn.prepareStatement("SELECT * FROM tickets WHERE id = 19");
            ResultSet rs = pstmt.executeQuery();
            if (rs.next()) {
                System.out.println("Ticket 19 found!");
                System.out.println("Numero: " + rs.getString("numero_ticket"));
                System.out.println("Statut: " + rs.getString("statut"));
                System.out.println("Patient ID: " + rs.getLong("patient_id"));
                System.out.println("Medecin ID: " + rs.getObject("medecin_id"));
                System.out.println("File ID: " + rs.getLong("file_attente_id"));
            } else {
                System.out.println("Ticket 19 NOT found.");
            }
            
            System.out.println("\nChecking Medecin for Ticket 19...");
            pstmt = conn.prepareStatement("SELECT m.*, u.nom FROM medecins m JOIN users u ON m.user_id = u.id WHERE m.id = (SELECT medecin_id FROM tickets WHERE id = 19)");
            rs = pstmt.executeQuery();
            if (rs.next()) {
                System.out.println("Medecin found: " + rs.getString("nom"));
            } else {
                System.out.println("Medecin NOT found or NOT assigned.");
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
