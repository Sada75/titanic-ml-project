from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import joblib
import numpy as np

# Initialize FastAPI app
app = FastAPI(title="Loan Approval Neural Network API")

# Enable CORS (for React frontend)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],      # OK for college project
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load trained neural network and scaler
model = joblib.load("loan_nn_model.pkl")
scaler = joblib.load("scaler.pkl")

@app.get("/")
def home():
    return {"message": "Loan Approval Neural Network API is running"}

@app.post("/predict")
def predict(data: dict):
    """
    Expects JSON:
    {
      gender, married, dependents, education, self_employed,
      applicant_income, coapplicant_income,
      loan_amount, loan_term, credit_history, property_area
    }
    """

    # Arrange input in correct order
    features = np.array([[
        data["gender"],
        data["married"],
        data["dependents"],
        data["education"],
        data["self_employed"],
        data["applicant_income"],
        data["coapplicant_income"],
        data["loan_amount"],
        data["loan_term"],
        data["credit_history"],
        data["property_area"]
    ]])

    # Scale input
    features_scaled = scaler.transform(features)

    probability = model.predict_proba(features_scaled)[0][1]

    prediction = 1 if probability >= 0.4 else 0


    # Probability (confidence)
    # probability = model.predict_proba(features_scaled)[0][1]

    return {
        "loan_status": "Approved" if prediction == 1 else "Rejected",
        "approval_probability": round(float(probability) * 100, 2)
    }
