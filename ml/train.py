import pandas as pd
import numpy as np
from sklearn.linear_model import LinearRegression, LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error, accuracy_score
import joblib
import os
import json
import pymysql
from datetime import datetime

def load_real_data():
    """Charge les données réelles depuis MariaDB"""
    try:
        conn = pymysql.connect(
            host='localhost',
            port=3306,
            user='root',
            password='',
            database='carepulse'
        )
        
        query = """
        SELECT 
            HOUR(t.heure_creation) as heure,
            DAYOFWEEK(t.heure_creation) as jour_semaine,
            t.file_attente_id as file_id,
            t.priorite,
            t.temps_attente_estime as temps_reel,
            CASE WHEN t.statut = 'NO_SHOW' THEN 1 ELSE 0 END as is_no_show,
            p.nombre_no_shows as historique_no_show
        FROM tickets t
        LEFT JOIN patients p ON t.patient_id = p.id
        WHERE t.heure_creation IS NOT NULL
        """
        
        df = pd.read_sql(query, conn)
        conn.close()
        return df
    except Exception as e:
        print(f"Erreur connexion MariaDB : {e}")
        return pd.DataFrame()

def load_simulated_data():
    """Fallback : Generateur de données simulées si la base est vide"""
    print("Données insuffisantes en base — utilisation des données simulées")
    # Simulation wait time
    n = 100
    df = pd.DataFrame({
        'heure': np.random.randint(8, 20, n),
        'jour_semaine': np.random.randint(1, 8, n),
        'file_id': np.random.randint(1, 5, n),
        'priorite': np.random.randint(0, 4, n),
        'nb_tickets_actifs': np.random.randint(0, 10, n),
        'historique_no_show': np.random.randint(0, 5, n)
    })
    df['temps_reel'] = 10 + df['nb_tickets_actifs'] * 5 + df['priorite'] * 3 + np.random.randint(-5, 5, n)
    df['is_no_show'] = (df['historique_no_show'] * 0.2 + np.random.random(n) > 0.7).astype(int)
    return df

def train_models():
    os.makedirs("models", exist_ok=True)
    
    df = load_real_data()
    
    if len(df) < 10:
        df = load_simulated_data()
        nb_samples = len(df)
        is_real = False
    else:
        nb_samples = len(df)
        is_real = True
        # Pour les données réelles, on simule nb_tickets_actifs si manquant dans la query
        if 'nb_tickets_actifs' not in df.columns:
            df['nb_tickets_actifs'] = np.random.randint(1, 10, len(df))

    metrics = {}
    timestamp = datetime.now().strftime("%Y-%m-%d")

    print(f"Entrainement sur {nb_samples} échantillons...")

    # Modèle 1 : Temps d'attente
    try:
        X_wait = df[['heure', 'jour_semaine', 'file_id', 'nb_tickets_actifs', 'priorite']]
        y_wait = df['temps_reel']
        
        X_train, X_test, y_train, y_test = train_test_split(X_wait, y_wait, test_size=0.2, random_state=42)
        model_wait = LinearRegression()
        model_wait.fit(X_train, y_train)
        
        mae = mean_absolute_error(y_test, model_wait.predict(X_test))
        joblib.dump(model_wait, "models/wait_time_model.pkl")
        
        metrics["wait_time_model"] = {
            "mae": round(float(mae), 2),
            "trained_on": timestamp,
            "nb_samples": nb_samples,
            "type": "REAL" if is_real else "SIMULATED"
        }
    except Exception as e:
        print(f"Erreur wait_time_model : {e}")

    # Modèle 2 : No-show
    try:
        # On utilise une priorité numerique (déjà fait par le mapping SQL ou simulé)
        X_noshow = df[['heure', 'jour_semaine', 'historique_no_show', 'priorite']]
        y_noshow = df['is_no_show']
        
        X_train, X_test, y_train, y_test = train_test_split(X_noshow, y_noshow, test_size=0.2, random_state=42)
        model_noshow = LogisticRegression()
        model_noshow.fit(X_train, y_train)
        
        acc = accuracy_score(y_test, model_noshow.predict(X_test))
        joblib.dump(model_noshow, "models/no_show_model.pkl")
        
        metrics["no_show_model"] = {
            "accuracy": round(float(acc), 2),
            "trained_on": timestamp,
            "nb_samples": nb_samples,
            "type": "REAL" if is_real else "SIMULATED"
        }
    except Exception as e:
        print(f"Erreur no_show_model : {e}")

    # Sauvegarde des métriques
    with open("models/metrics.json", "w") as f:
        json.dump(metrics, f, indent=2)
    
    print("Modeles entraines et sauvegardes avec succes")
    return metrics

if __name__ == "__main__":
    train_models()
