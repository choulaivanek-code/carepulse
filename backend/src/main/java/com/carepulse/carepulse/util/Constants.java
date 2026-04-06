package com.carepulse.carepulse.util;

public final class Constants {

    private Constants() {}

    // JWT
    public static final String JWT_SECRET = "404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970";
    public static final long JWT_EXPIRATION = 86400000L; // 24h
    public static final long REFRESH_TOKEN_EXPIRATION = 604800000L; // 7j
    public static final String JWT_HEADER = "Authorization";
    public static final String JWT_PREFIX = "Bearer ";

    // Roles
    public static final String ROLE_PATIENT = "ROLE_PATIENT";
    public static final String ROLE_AGENT = "ROLE_AGENT";
    public static final String ROLE_MEDECIN = "ROLE_MEDECIN";
    public static final String ROLE_ADMIN = "ROLE_ADMIN";

    // Ticket
    public static final int MAX_TICKETS_PER_DAY = 200;
    public static final int DUREE_MOYENNE_CONSULTATION = 15; // minutes
    public static final int AUTO_CANCEL_NO_SHOW_MINUTES = 20;
    public static final double ML_NO_SHOW_THRESHOLD = 0.60;
    public static final int NO_SHOW_WAIT_MINUTES = 3;

    // Scoring
    public static final int SCORE_BASE = 100;
    public static final int SCORE_URGENCE = 1000;
    public static final int SCORE_AGE = 200;
    public static final int SCORE_GROSSESSE = 300;
    public static final int SCORE_ATTENTE = 50;
    public static final int AGE_PRIORITAIRE = 70;
    public static final int ATTENTE_PRIORITAIRE_MINUTES = 60;

    // Fiabilite patient
    public static final double FIABILITE_INITIALE = 1.0;
    public static final double FIABILITE_PENALITE = 0.10;
    public static final double FIABILITE_BONUS = 0.05;
    public static final double FIABILITE_MIN = 0.0;
    public static final double FIABILITE_MAX = 1.0;

    // Notifications
    public static final int NOTIF_AVANT_MINUTES_1 = 15;
    public static final int NOTIF_AVANT_MINUTES_2 = 5;
    public static final int NOTIF_RETENTION_DAYS = 90;

    // ML
    public static final String ML_SERVICE_URL = "http://localhost:8000";
    public static final int ML_TIMEOUT_SECONDS = 5;
    public static final double ML_FALLBACK_WAIT_TIME = 30.0;
    public static final double ML_FALLBACK_NO_SHOW_SCORE = 0.0;

    // Surcharge
    public static final int SURCHARGE_WARNING_TICKETS = 15;
    public static final int SURCHARGE_CRITICAL_TICKETS = 25;

    // Audit
    public static final int MAX_LOGIN_ATTEMPTS = 5;
    public static final int LOCK_TIME_MINUTES = 30;

    // Messages erreur
    public static final String ERR_USER_NOT_FOUND = "Utilisateur non trouve";
    public static final String ERR_TICKET_NOT_FOUND = "Ticket non trouve";
    public static final String ERR_UNAUTHORIZED = "Acces non autorise";
    public static final String ERR_INVALID_CREDENTIALS = "Identifiants invalides";
    public static final String ERR_USER_ALREADY_EXISTS = "Email deja utilise";
}
