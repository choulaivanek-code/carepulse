from fastapi import FastAPI
from pydantic import BaseModel
import joblib
import numpy as np
import os

app = FastAPI(title="CarePulse ML Service", version="1.0.0")

wait_model = None
noshow_model = None

def load_models():
    global wait_model, noshow_model
    try:
        wait_model = joblib.load("models/wait_time_model.pkl")
        print("Modele temps attente charge")
    except Exception as e:
        print(f"Erreur chargement modele temps attente : {e}")
    try:
        noshow_model = joblib.load("models/no_show_model.pkl")
        print("Modele no-show charge")
    except Exception as e:
        print(f"Erreur chargement modele no-show : {e}")

load_models()

class WaitTimeRequest(BaseModel):
    nombre_tickets_en_attente: int
    heure_journee: int
    jour_semaine: int
    medecin_disponibles: int
    duree_consultation_moyenne: float

class WaitTimeResponse(BaseModel):
    temps_attente_minutes: float
    marge_erreur_minutes: float

class NoShowRequest(BaseModel):
    score_fiabilite_patient: float
    nombre_no_shows_historique: int
    heure_creation_ticket: int
    est_urgence: int
    distance_clinique_km: float

class NoShowResponse(BaseModel):
    score_no_show: float
    risque_eleve: bool

class OverloadRequest(BaseModel):
    nombre_tickets_actifs: int
    capacite_max: int
    nombre_medecins: int
    heure_journee: int

class OverloadResponse(BaseModel):
    niveau: str
    surcharge: bool
    message: str

@app.get("/")
def root():
    return {"status": "CarePulse ML Service actif"}

@app.get("/health")
def health():
    return {
        "status": "ok",
        "wait_model": wait_model is not None,
        "noshow_model": noshow_model is not None
    }

@app.post("/predict/wait-time", response_model=WaitTimeResponse)
def predict_wait_time(request: WaitTimeRequest):
    if wait_model is None:
        return WaitTimeResponse(temps_attente_minutes=30.0, marge_erreur_minutes=10.0)
    try:
        features = np.array([[
            request.nombre_tickets_en_attente,
            request.heure_journee,
            request.jour_semaine,
            request.medecin_disponibles,
            request.duree_consultation_moyenne
        ]])
        prediction = wait_model.predict(features)[0]
        return WaitTimeResponse(
            temps_attente_minutes=round(float(prediction), 2),
            marge_erreur_minutes=10.0
        )
    except Exception:
        return WaitTimeResponse(temps_attente_minutes=30.0, marge_erreur_minutes=10.0)

@app.post("/predict/no-show", response_model=NoShowResponse)
def predict_no_show(request: NoShowRequest):
    if noshow_model is None:
        return NoShowResponse(score_no_show=0.0, risque_eleve=False)
    try:
        features = np.array([[
            request.score_fiabilite_patient,
            request.nombre_no_shows_historique,
            request.heure_creation_ticket,
            request.est_urgence,
            request.distance_clinique_km
        ]])
        proba = noshow_model.predict_proba(features)[0][1]
        return NoShowResponse(
            score_no_show=round(float(proba), 4),
            risque_eleve=float(proba) >= 0.60
        )
    except Exception:
        return NoShowResponse(score_no_show=0.0, risque_eleve=False)

@app.post("/detect/overload", response_model=OverloadResponse)
def detect_overload(request: OverloadRequest):
    try:
        taux = request.nombre_tickets_actifs / max(request.capacite_max, 1)
        if taux >= 0.90:
            return OverloadResponse(niveau="CRITICAL", surcharge=True, message="Surcharge critique")
        elif taux >= 0.70:
            return OverloadResponse(niveau="WARNING", surcharge=True, message="Surcharge moderee")
        else:
            return OverloadResponse(niveau="NORMAL", surcharge=False, message="Charge normale")
    except Exception:
        return OverloadResponse(niveau="NORMAL", surcharge=False, message="Erreur detection")