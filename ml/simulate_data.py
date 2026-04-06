import pandas as pd
import numpy as np

np.random.seed(42)
n = 1000

data_wait = pd.DataFrame({
    "nombre_tickets_en_attente": np.random.randint(1, 30, n),
    "heure_journee": np.random.randint(8, 18, n),
    "jour_semaine": np.random.randint(1, 6, n),
    "medecin_disponibles": np.random.randint(1, 5, n),
    "duree_consultation_moyenne": np.random.uniform(10, 25, n),
    "temps_attente_minutes": np.random.uniform(5, 120, n)
})

data_noshow = pd.DataFrame({
    "score_fiabilite_patient": np.random.uniform(0.5, 1.0, n),
    "nombre_no_shows_historique": np.random.randint(0, 10, n),
    "heure_creation_ticket": np.random.randint(8, 18, n),
    "est_urgence": np.random.randint(0, 2, n),
    "distance_clinique_km": np.random.uniform(0.5, 20, n),
    "no_show": np.random.randint(0, 2, n)
})

data_wait.to_csv("data/wait_time_data.csv", index=False)
data_noshow.to_csv("data/no_show_data.csv", index=False)
print("Donnees generees avec succes")