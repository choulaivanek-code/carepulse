import java.sql.*;
import java.util.*;

public class ListTables {
    public static void main(String[] args) {
        String url = "jdbc:mariadb://localhost:3306/carepulse";
        String user = "root";
        String password = "";
        try (Connection conn = DriverManager.getConnection(url, user, password)) {
            DatabaseMetaData md = conn.getMetaData();
            ResultSet rs = md.getTables("carepulse", null, "%", new String[]{"TABLE"});
            System.out.println("Tables in carepulse:");
            while (rs.next()) {
                System.out.println(rs.getString("TABLE_NAME"));
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
