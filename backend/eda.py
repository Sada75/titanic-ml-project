import pandas as pd
import matplotlib.pyplot as plt
from sklearn.preprocessing import StandardScaler
import os
import seaborn as sns
from sklearn.metrics import roc_curve, auc
import joblib


# Create output directory
os.makedirs("eda_outputs", exist_ok=True)

# Load dataset
df = pd.read_csv("loan_prediction.csv")

# -------------------------------
# 1. Missing values BEFORE cleaning
# -------------------------------
missing_before = df.isnull().sum()
missing_before = missing_before[missing_before > 0]

if not missing_before.empty:
    missing_before.plot(kind="bar", figsize=(8,4))
    plt.title("Missing Values Before Preprocessing")
    plt.ylabel("Count")
    plt.tight_layout()
    plt.savefig("eda_outputs/missing_before.png")
    plt.close()

# -------------------------------
# Data Cleaning
# -------------------------------
df["Gender"] = df["Gender"].fillna("Male")
df["Married"] = df["Married"].fillna("Yes")
df["Dependents"] = df["Dependents"].fillna("0")
df["Self_Employed"] = df["Self_Employed"].fillna("No")
df["LoanAmount"] = df["LoanAmount"].fillna(df["LoanAmount"].median())
df["Loan_Amount_Term"] = df["Loan_Amount_Term"].fillna(360)
df["Credit_History"] = df["Credit_History"].fillna(1.0)

# -------------------------------
# 2. Missing values AFTER cleaning
# -------------------------------
missing_after = df.isnull().sum()
missing_after = missing_after[missing_after > 0]

if missing_after.empty:
    print("✅ No missing values after preprocessing")

# -------------------------------
# 3. Target Class Distribution
# -------------------------------
df["Loan_Status"].value_counts().plot(kind="bar", color=["red", "green"])
plt.title("Loan Status Distribution")
plt.xlabel("Loan Status")
plt.ylabel("Count")
plt.tight_layout()
plt.savefig("eda_outputs/loan_status_distribution.png")
plt.close()

# -------------------------------
# 4. Feature Scaling Visualization
# -------------------------------
plt.hist(df["ApplicantIncome"], bins=30)
plt.title("Applicant Income (Before Scaling)")
plt.xlabel("Income")
plt.ylabel("Frequency")
plt.tight_layout()
plt.savefig("eda_outputs/income_before_scaling.png")
plt.close()

scaler = StandardScaler()
scaled_income = scaler.fit_transform(df[["ApplicantIncome"]])

plt.hist(scaled_income, bins=30)
plt.title("Applicant Income (After Scaling)")
plt.xlabel("Scaled Value")
plt.ylabel("Frequency")
plt.tight_layout()
plt.savefig("eda_outputs/income_after_scaling.png")
plt.close()

print("✅ EDA plots saved in eda_outputs/")

#-------------------------------
# 5. Correlation Heatmap
# -------------------------------

# Encode categorical variables for correlation
df_corr = df.copy()

from sklearn.preprocessing import LabelEncoder
le = LabelEncoder()
for col in df_corr.select_dtypes(include="object"):
    df_corr[col] = le.fit_transform(df_corr[col])

plt.figure(figsize=(10, 6))
sns.heatmap(df_corr.corr(), cmap="coolwarm", annot=False)
plt.title("Correlation Heatmap of Loan Dataset")
plt.tight_layout()
plt.savefig("eda_outputs/correlation_heatmap.png")
plt.close()


# -------------------------------
# 6. Boxplot for Outliers
# -------------------------------

plt.figure(figsize=(6,4))
sns.boxplot(x=df["ApplicantIncome"])
plt.title("Boxplot of Applicant Income (Outliers)")
plt.tight_layout()
plt.savefig("eda_outputs/applicant_income_boxplot.png")
plt.close()



# -------------------------------
# 7. ROC Curve for Neural Network
# -------------------------------

# Load trained NN and scaler
model = joblib.load("loan_nn_model.pkl")
scaler = joblib.load("scaler.pkl")

# Drop Loan_ID (must match training)
df_roc = df_corr.drop("Loan_ID", axis=1)

X = df_roc.drop("Loan_Status", axis=1)
y = df_roc["Loan_Status"]

# Scale features (now names match)
X_scaled = scaler.transform(X)

# Predict probabilities
y_prob = model.predict_proba(X_scaled)[:, 1]

# ROC curve
fpr, tpr, _ = roc_curve(y, y_prob)
roc_auc = auc(fpr, tpr)

plt.figure(figsize=(6,4))
plt.plot(fpr, tpr, label=f"AUC = {roc_auc:.2f}")
plt.plot([0, 1], [0, 1], linestyle="--")
plt.xlabel("False Positive Rate")
plt.ylabel("True Positive Rate")
plt.title("ROC Curve - Neural Network")
plt.legend(loc="lower right")
plt.tight_layout()
plt.savefig("eda_outputs/roc_curve.png")
plt.close()