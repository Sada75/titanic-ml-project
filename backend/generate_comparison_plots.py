import pandas as pd
import numpy as np
import joblib
import os
import matplotlib.pyplot as plt
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, roc_curve, auc

# -------------------------------
# Setup
# -------------------------------
os.makedirs("static/comparisons", exist_ok=True)

# -------------------------------
# Load dataset
# -------------------------------
df = pd.read_csv("loan_prediction.csv")

# -------------------------------
# Data Cleaning (SAME AS TRAINING)
# -------------------------------
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

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

# -------------------------------
# Scaling
# -------------------------------
scaler = joblib.load("scaler.pkl")
X_test_scaled = scaler.transform(X_test)

# -------------------------------
# Load models
# -------------------------------
models = {
    "Neural Network": joblib.load("models/nn.pkl"),
    "SVM": joblib.load("models/svm.pkl"),
    "Decision Tree": joblib.load("models/decision_tree.pkl"),
    "KNN": joblib.load("models/knn.pkl"),
}

# -------------------------------
# 1️⃣ Accuracy Comparison
# -------------------------------
accuracies = {}

for name, model in models.items():
    preds = model.predict(X_test_scaled)
    acc = accuracy_score(y_test, preds)
    accuracies[name] = acc

plt.figure(figsize=(7, 5))
plt.bar(accuracies.keys(), accuracies.values())
plt.ylabel("Accuracy")
plt.title("Model Accuracy Comparison")
plt.ylim(0, 1)
plt.tight_layout()
plt.savefig("static/comparisons/accuracy_comparison.png")
plt.close()

# -------------------------------
# 2️⃣ ROC Curve Comparison
# -------------------------------
plt.figure(figsize=(7, 5))

for name, model in models.items():
    y_prob = model.predict_proba(X_test_scaled)[:, 1]
    fpr, tpr, _ = roc_curve(y_test, y_prob)
    roc_auc = auc(fpr, tpr)
    plt.plot(fpr, tpr, label=f"{name} (AUC = {roc_auc:.2f})")

plt.plot([0, 1], [0, 1], linestyle="--")
plt.xlabel("False Positive Rate")
plt.ylabel("True Positive Rate")
plt.title("ROC Curve Comparison")
plt.legend()
plt.tight_layout()
plt.savefig("static/comparisons/roc_comparison.png")
plt.close()

print("✅ Comparison plots generated successfully!")


from sklearn.metrics import precision_recall_curve, average_precision_score

# -------------------------------
# 3️⃣ Precision-Recall Curve Comparison
# -------------------------------
plt.figure(figsize=(7, 5))

for name, model in models.items():
    y_prob = model.predict_proba(X_test_scaled)[:, 1]
    precision, recall, _ = precision_recall_curve(y_test, y_prob)
    avg_prec = average_precision_score(y_test, y_prob)
    plt.plot(recall, precision, label=f"{name} (AP = {avg_prec:.2f})")

plt.xlabel("Recall")
plt.ylabel("Precision")
plt.title("Precision-Recall Curve Comparison")
plt.legend()
plt.tight_layout()
plt.savefig("static/comparisons/precision_recall_comparison.png")
plt.close()


from sklearn.metrics import confusion_matrix
import seaborn as sns

# -------------------------------
# 4️⃣ Confusion Matrices
# -------------------------------
fig, axes = plt.subplots(2, 2, figsize=(8, 8))
axes = axes.flatten()

for ax, (name, model) in zip(axes, models.items()):
    preds = model.predict(X_test_scaled)
    cm = confusion_matrix(y_test, preds)

    sns.heatmap(
        cm,
        annot=True,
        fmt="d",
        cmap="Blues",
        ax=ax,
        cbar=False
    )
    ax.set_title(name)
    ax.set_xlabel("Predicted")
    ax.set_ylabel("Actual")

plt.tight_layout()
plt.savefig("static/comparisons/confusion_matrices.png")
plt.close()


# -------------------------------
# 5️⃣ Prediction Probability Distribution
# -------------------------------
plt.figure(figsize=(7, 5))

for name, model in models.items():
    y_prob = model.predict_proba(X_test_scaled)[:, 1]
    plt.hist(
        y_prob,
        bins=20,
        alpha=0.5,
        label=name
    )

plt.xlabel("Predicted Approval Probability")
plt.ylabel("Frequency")
plt.title("Prediction Probability Distribution")
plt.legend()
plt.tight_layout()
plt.savefig("static/comparisons/probability_distribution.png")
plt.close()

