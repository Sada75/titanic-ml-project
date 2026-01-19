from fastapi import FastAPI
from pydantic import BaseModel
import joblib
import numpy as np
from fastapi.middleware.cors import CORSMiddleware

# -------------------------------
# App setup
# -------------------------------
app = FastAPI(title="Loan Approval Prediction API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -------------------------------
# Load scaler and models
# -------------------------------
scaler = joblib.load("scaler.pkl")

models = {
    "neural_network": joblib.load("models/nn.pkl"),
    "svm": joblib.load("models/svm.pkl"),
    "decision_tree": joblib.load("models/decision_tree.pkl"),
    "knn": joblib.load("models/knn.pkl"),
}

# -------------------------------
# Request schema
# -------------------------------
class PredictionRequest(BaseModel):
    model: str
    gender: int
    married: int
    dependents: int
    education: int
    self_employed: int
    applicant_income: float
    coapplicant_income: float
    loan_amount: float
    loan_term: float
    credit_history: float
    property_area: int
    threshold: float = 0.5


# -------------------------------
# Prediction endpoint
# -------------------------------
@app.post("/predict")
def predict(req: PredictionRequest):
    if req.model not in models:
        return {"error": "Invalid model selected"}

    # Feature vector (order MUST match training)
    X = np.array([[
        req.gender,
        req.married,
        req.dependents,
        req.education,
        req.self_employed,
        req.applicant_income,
        req.coapplicant_income,
        req.loan_amount,
        req.loan_term,
        req.credit_history,
        req.property_area
    ]])

    # Scale input
    X_scaled = scaler.transform(X)

    # Select model
    model = models[req.model]

    # Predict probability
    prob = model.predict_proba(X_scaled)[0][1]

    # Threshold-based decision
    decision = "Approved" if prob >= req.threshold else "Rejected"

    return {
        "model_used": req.model,
        "approval_probability": round(prob * 100, 2),
        "decision": decision
    }
