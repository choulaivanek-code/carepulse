import java.sql.*;

public class CheckSchema {
    public static void main(String[] args) {
        String url = "jdbc:mariadb://localhost:3306/carepulse";
        String user = "root";
        String password = "";
        try (Connection conn = DriverManager.getConnection(url, user, password)) {
            DatabaseMetaData md = conn.getMetaData();
            ResultSet rs = md.getColumns("carepulse", null, "patients", null);
            System.out.println("Columns in patients:");
            boolean found = false;
            while (rs.next()) {
                String col = rs.getString("COLUMN_NAME");
                System.out.println("- " + col);
                if ("points_fidelite".equalsIgnoreCase(col)) found = true;
            }
            if (!found) {
                System.out.println("\nColumn points_fidelite NOT FOUND! Adding it...");
                try (Statement stmt = conn.createStatement()) {
                    stmt.executeUpdate("ALTER TABLE patients ADD COLUMN points_fidelite INT DEFAULT 0");
                    stmt.executeUpdate("UPDATE patients SET points_fidelite = 0 WHERE points_fidelite IS NULL");
                    System.out.println("Column added successfully.");
                }
            } else {
                System.out.println("\nColumn points_fidelite exists.");
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
