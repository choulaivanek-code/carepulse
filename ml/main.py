from fastapi import FastAPI, BackgroundTasks
from pydantic import BaseModel
import joblib
import numpy as np
import os
import json
from train import train_models

app = FastAPI(title="CarePulse ML Service", version="1.1.0")

wait_model = None
noshow_model = None

def load_models():
    global wait_model, noshow_model
    try:
        if os.path.exists("models/wait_time_model.pkl"):
            wait_model = joblib.load("models/wait_time_model.pkl")
            print("Modele temps attente charge")
        else:
            print("Modele temps attente non trouve")
    except Exception as e:
        print(f"Erreur chargement modele temps attente : {e}")
        
    try:
        if os.path.exists("models/no_show_model.pkl"):
            noshow_model = joblib.load("models/no_show_model.pkl")
            print("Modele no-show charge")
        else:
            print("Modele no-show non trouve")
    except Exception as e:
        print(f"Erreur chargement modele no-show : {e}")

load_models()

class WaitTimeRequest(BaseModel):
    heure: int
    jour_semaine: int
    file_id: int
    nb_tickets_actifs: int
    priorite: int

class WaitTimeResponse(BaseModel):
    temps_attente_minutes: int
    nb_samples: int
    type: str

class NoShowRequest(BaseModel):
    heure: int
    jour_semaine: int
    historique_no_show: int
    priorite: int

class NoShowResponse(BaseModel):
    score_no_show: float
    risque_eleve: bool
    nb_samples: int
    type: str

@app.get("/")
def root():
    return {"status": "CarePulse ML Service actif"}

@app.get("/health")
def health():
    metrics = {}
    if os.path.exists("models/metrics.json"):
        try:
            with open("models/metrics.json", "r") as f:
                metrics = json.load(f)
        except Exception:
            pass

    models_info = []
    
    # Wait Time Model
    m1 = metrics.get("wait_time_model", {})
    wait_info = {
        "nom": "wait_time_model",
        "statut": "ACTIF" if wait_model is not None else "ERREUR",
        "precision": round((1 - (m1.get("mae", 0) / 30)) * 100, 1) if m1.get("mae") else 0, # Approximation precision
        "nb_samples": m1.get("nb_samples", 0),
        "last_trained": m1.get("trained_on", "N/A"),
        "type": m1.get("type", "UNKNOWN")
    }
    models_info.append(wait_info)
    
    # No Show Model
    m2 = metrics.get("no_show_model", {})
    noshow_info = {
        "nom": "no_show_model",
        "statut": "ACTIF" if noshow_model is not None else "ERREUR",
        "precision": m2.get("accuracy", 0) * 100,
        "nb_samples": m2.get("nb_samples", 0),
        "last_trained": m2.get("trained_on", "N/A"),
        "type": m2.get("type", "UNKNOWN")
    }
    models_info.append(noshow_info)

    avg_precision = sum(m["precision"] for m in models_info) / len(models_info) if models_info else 0

    return {
        "status": "ok",
        "serviceActif": True,
        "modeles": models_info,
        "precisionMoyenne": round(avg_precision, 1)
    }

@app.post("/train")
def train(background_tasks: BackgroundTasks):
    try:
        # On lance l'entrainement en arrière-plan car MariaDB peut être lent
        background_tasks.add_task(run_training_and_reload)
        return {"status": "success", "message": "Entrainement lance en arriere-plan"}
    except Exception as e:
        return {"status": "error", "message": str(e)}

def run_training_and_reload():
    train_models()
    load_models()

@app.post("/predict/wait-time", response_model=WaitTimeResponse)
def predict_wait_time(request: WaitTimeRequest):
    metrics = {}
    if os.path.exists("models/metrics.json"):
        with open("models/metrics.json", "r") as f:
            metrics = json.load(f).get("wait_time_model", {})

    if wait_model is None:
        return WaitTimeResponse(temps_attente_minutes=15, nb_samples=0, type="FALLBACK")
    
    try:
        features = np.array([[
            request.heure,
            request.jour_semaine,
            request.file_id,
            request.nb_tickets_actifs,
            request.priorite
        ]])
        prediction = wait_model.predict(features)[0]
        return WaitTimeResponse(
            temps_attente_minutes=max(1, int(round(float(prediction)))),
            nb_samples=metrics.get("nb_samples", 0),
            type=metrics.get("type", "UNKNOWN")
        )
    except Exception:
        return WaitTimeResponse(temps_attente_minutes=15, nb_samples=0, type="ERROR")

@app.post("/predict/no-show", response_model=NoShowResponse)
def predict_no_show(request: NoShowRequest):
    metrics = {}
    if os.path.exists("models/metrics.json"):
        with open("models/metrics.json", "r") as f:
            metrics = json.load(f).get("no_show_model", {})

    if noshow_model is None:
        return NoShowResponse(score_no_show=0.0, risque_eleve=False, nb_samples=0, type="FALLBACK")
    
    try:
        features = np.array([[
            request.heure,
            request.jour_semaine,
            request.historique_no_show,
            request.priorite
        ]])
        proba = noshow_model.predict_proba(features)[0][1]
        return NoShowResponse(
            score_no_show=round(float(proba), 4),
            risque_eleve=float(proba) >= 0.60,
            nb_samples=metrics.get("nb_samples", 0),
            type=metrics.get("type", "UNKNOWN")
        )
    except Exception:
        return NoShowResponse(score_no_show=0.0, risque_eleve=False, nb_samples=0, type="ERROR")