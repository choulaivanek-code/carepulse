import pandas as pd
import numpy as np
from sklearn.linear_model import LinearRegression, LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error, accuracy_score
import joblib
import os
import json

def train_models():
    os.makedirs("models", exist_ok=True)
    
    metrics = {}

    print("Entrainement modele 1 : Temps d attente...")
    try:
        df_wait = pd.read_csv("data/wait_time_data.csv")
        X_wait = df_wait.drop("temps_attente_minutes", axis=1)
        y_wait = df_wait["temps_attente_minutes"]
        X_train, X_test, y_train, y_test = train_test_split(X_wait, y_wait, test_size=0.2, random_state=42)
        model_wait = LinearRegression()
        model_wait.fit(X_train, y_train)
        mae = mean_absolute_error(y_test, model_wait.predict(X_test))
        print(f"MAE temps attente : {mae:.2f} minutes")
        joblib.dump(model_wait, "models/wait_time_model.pkl")
        metrics["wait_time_model"] = {"accuracy": round(1 - (mae / y_wait.mean()), 4), "mae": round(mae, 2)}
    except Exception as e:
        print(f"Erreur entrainement wait_time_model : {e}")
        metrics["wait_time_model"] = {"accuracy": 0, "error": str(e)}

    print("Entrainement modele 2 : No-show...")
    try:
        df_noshow = pd.read_csv("data/no_show_data.csv")
        X_noshow = df_noshow.drop("no_show", axis=1)
        y_noshow = df_noshow["no_show"]
        X_train2, X_test2, y_train2, y_test2 = train_test_split(X_noshow, y_noshow, test_size=0.2, random_state=42)
        model_noshow = LogisticRegression()
        model_noshow.fit(X_train2, y_train2)
        acc = accuracy_score(y_test2, model_noshow.predict(X_test2))
        print(f"Precision no-show : {acc:.2f}")
        joblib.dump(model_noshow, "models/no_show_model.pkl")
        metrics["no_show_model"] = {"accuracy": round(acc, 4)}
    except Exception as e:
        print(f"Erreur entrainement no_show_model : {e}")
        metrics["no_show_model"] = {"accuracy": 0, "error": str(e)}

    # Sauvegarde des métriques
    with open("models/metrics.json", "w") as f:
        json.dump(metrics, f)
    
    print("Modeles entraines et sauvegardes avec succes")
    return metrics

if __name__ == "__main__":
    train_models()
