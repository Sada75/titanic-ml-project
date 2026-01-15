import pandas as pd
import joblib
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.neural_network import MLPClassifier
from sklearn.metrics import accuracy_score

# Load dataset
df = pd.read_csv("loan_prediction.csv")

# Drop Loan_ID
df.drop("Loan_ID", axis=1, inplace=True)

# Handle missing values
df["Gender"] = df["Gender"].fillna("Male")
df["Married"] = df["Married"].fillna("Yes")
df["Dependents"] = df["Dependents"].fillna("0")
df["Self_Employed"] = df["Self_Employed"].fillna("No")
df["LoanAmount"] = df["LoanAmount"].fillna(df["LoanAmount"].median())
df["Loan_Amount_Term"] = df["Loan_Amount_Term"].fillna(360)
df["Credit_History"] = df["Credit_History"].fillna(1.0)

# Encode categorical columns
categorical_cols = [
    "Gender", "Married", "Dependents",
    "Education", "Self_Employed",
    "Property_Area", "Loan_Status"
]

encoder = LabelEncoder()
for col in categorical_cols:
    df[col] = encoder.fit_transform(df[col])

X = df.drop("Loan_Status", axis=1)
y = df["Loan_Status"]

# Scale features
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)
joblib.dump(scaler, "scaler.pkl")

# Train-test split
X_train, X_test, y_train, y_test = train_test_split(
    X_scaled, y, test_size=0.2, random_state=42
)

# 🔥 Neural Network (ANN)
model = MLPClassifier(
    hidden_layer_sizes=(16, 8),
    activation="relu",
    solver="adam",
    max_iter=500,
    random_state=42
)

model.fit(X_train, y_train)

# Evaluate
preds = model.predict(X_test)
accuracy = accuracy_score(y_test, preds)
print("Neural Network Accuracy:", accuracy)

# Save model
joblib.dump(model, "loan_nn_model.pkl")
