import pandas as pd
import joblib
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.svm import SVC
from sklearn.tree import DecisionTreeClassifier
from sklearn.neighbors import KNeighborsClassifier
from sklearn.metrics import accuracy_score
import os

# -------------------------------
# Load dataset
# -------------------------------
df = pd.read_csv("loan_prediction.csv")

# -------------------------------
# Data Cleaning (SAME AS NN)
# -------------------------------
# Data Cleaning
df["Gender"] = df["Gender"].fillna("Male")
df["Married"] = df["Married"].fillna("Yes")
df["Dependents"] = df["Dependents"].fillna("0")
df["Dependents"] = df["Dependents"].replace("3+", "3")
df["Self_Employed"] = df["Self_Employed"].fillna("No")
df["LoanAmount"] = df["LoanAmount"].fillna(df["LoanAmount"].median())
df["Loan_Amount_Term"] = df["Loan_Amount_Term"].fillna(360)
df["Credit_History"] = df["Credit_History"].fillna(1.0)


# -------------------------------
# Encoding
# -------------------------------
df.replace({
    "Gender": {"Male": 1, "Female": 0},
    "Married": {"Yes": 1, "No": 0},
    "Education": {"Graduate": 1, "Not Graduate": 0},
    "Self_Employed": {"Yes": 1, "No": 0},
    "Property_Area": {"Urban": 2, "Semiurban": 1, "Rural": 0},
    "Loan_Status": {"Y": 1, "N": 0}
}, inplace=True)

df.drop("Loan_ID", axis=1, inplace=True)

# -------------------------------
# Split features and target
# -------------------------------
X = df.drop("Loan_Status", axis=1)
y = df["Loan_Status"]

# -------------------------------
# Train-test split
# -------------------------------
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

# -------------------------------
# Scaling (VERY IMPORTANT)
# -------------------------------
scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)

joblib.dump(scaler, "scaler.pkl")

# -------------------------------
# Train Models
# -------------------------------

models = {
    "svm": SVC(kernel="rbf", probability=True),
    "decision_tree": DecisionTreeClassifier(max_depth=5, random_state=42),
    "knn": KNeighborsClassifier(n_neighbors=7)
}

os.makedirs("models", exist_ok=True)

for name, model in models.items():
    model.fit(X_train_scaled, y_train)
    preds = model.predict(X_test_scaled)
    acc = accuracy_score(y_test, preds)
    joblib.dump(model, f"models/{name}.pkl")
    print(f"{name.upper()} Accuracy: {acc:.4f}")
