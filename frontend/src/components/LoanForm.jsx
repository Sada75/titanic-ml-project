import { useState } from "react";

const modelDetails = {
  neural_network: {
    name: "Neural Network (MLP)",
    layers: "2 Hidden Layers (16, 8)",
    activation: "ReLU (hidden), Sigmoid (output)",
    optimizer: "Adam",
    accuracy: "≈ 76%",
    dataset: "Loan Approval Dataset"
  },
  svm: {
    name: "Support Vector Machine",
    layers: "Kernel-based (RBF)",
    activation: "Non-linear (Kernel Trick)",
    optimizer: "SMO",
    accuracy: "≈ 78%",
    dataset: "Loan Approval Dataset"
  },
  decision_tree: {
    name: "Decision Tree",
    layers: "Tree Depth = 5",
    activation: "Rule-based splits",
    optimizer: "Greedy (Gini Index)",
    accuracy: "≈ 73%",
    dataset: "Loan Approval Dataset"
  },
  knn: {
    name: "K-Nearest Neighbors",
    layers: "k = 7",
    activation: "Distance-based",
    optimizer: "Lazy Learning",
    accuracy: "≈ 75%",
    dataset: "Loan Approval Dataset"
  }
};



export default function LoanForm() {
  const [form, setForm] = useState({
    gender: "",
    married: "",
    dependents: "",
    education: "",
    self_employed: "",
    applicant_income: "",
    coapplicant_income: "",
    loan_amount: "",
    loan_term: "",
    credit_history: "",
    property_area: ""
  });

  const modelInfo = {
    name: "Neural Network (MLP)",
    layers: "2 Hidden Layers (16, 8)",
    activation: "ReLU + Sigmoid",
    optimizer: "Adam",
    accuracy: "≈ 76%",
    dataset: "Loan Approval Dataset"
  };
  

  // Decision Variables
  const [probability, setProbability] = useState(null);
  const [threshold, setThreshold] = useState(40); // default 40%
  const [finalDecision, setFinalDecision] = useState(null);
  const [risk, setRisk] = useState("");
  const [explanations, setExplanations] = useState([]);
  const [errors, setErrors] = useState({});
  const [selectedModel, setSelectedModel] = useState("neural_network");




  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    const newErrors = {};
  
    Object.keys(form).forEach((key) => {
      if (form[key] === "") {
        newErrors[key] = "This field is required";
      }
    });
  
    if (form.applicant_income && Number(form.applicant_income) <= 0) {
      newErrors.applicant_income = "Income must be greater than 0";
    }
  
    if (form.loan_amount && Number(form.loan_amount) <= 0) {
      newErrors.loan_amount = "Loan amount must be greater than 0";
    }
  
    if (form.credit_history && !["0", "1"].includes(form.credit_history)) {
      newErrors.credit_history = "Credit history must be 0 or 1";
    }
  
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  

  const predictLoan = async () => {
    if (!validateForm()) return;
    const response = await fetch("http://127.0.0.1:8000/predict", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: selectedModel,
        threshold: threshold / 100,
        gender: Number(form.gender),
        married: Number(form.married),
        dependents: Number(form.dependents),
        education: Number(form.education),
        self_employed: Number(form.self_employed),
        applicant_income: Number(form.applicant_income),
        coapplicant_income: Number(form.coapplicant_income),
        loan_amount: Number(form.loan_amount),
        loan_term: Number(form.loan_term),
        credit_history: Number(form.credit_history),
        property_area: Number(form.property_area)
      })
    });

    const data = await response.json();

    const prob = data.approval_probability;

    setFinalDecision(data.decision);
    setProbability(data.approval_probability);


    // Decision based on threshold
    if (prob >= threshold) {
      setFinalDecision("Approved");
    } else {
      setFinalDecision("Rejected");
    }

    // ----------------------------
    // Decision Explanation Logic
    // ----------------------------
    const reasons = [];

    if (form.credit_history === "1") {
      reasons.push("Good credit history");
    } else {
      reasons.push("Poor credit history");
    }

    if (Number(form.applicant_income) >= 4000) {
      reasons.push("Applicant income is sufficient");
    } else {
      reasons.push("Low applicant income");
    }

    if (Number(form.loan_amount) <= 200) {
      reasons.push("Loan amount is reasonable");
    } else {
      reasons.push("High loan amount increases risk");
    }

    if (Number(form.dependents) <= 1) {
      reasons.push("Low number of dependents");
    } else {
      reasons.push("Higher number of dependents");
    }

    setExplanations(reasons);


    // Risk label
    if (prob >= 75) setRisk("Low Risk");
    else if (prob >= 50) setRisk("Medium Risk");
    else setRisk("High Risk");
  };

  const placeholders = {
    gender: "Gender (0 = Female, 1 = Male)",
    married: "Married (0 = No, 1 = Yes)",
    dependents: "Dependents (0, 1, 2, 3)",
    education: "Education (0 = Graduate, 1 = Not Graduate)",
    self_employed: "Self Employed (0 = No, 1 = Yes)",
    applicant_income: "Applicant Income (e.g. 5000)",
    coapplicant_income: "Coapplicant Income (e.g. 0)",
    loan_amount: "Loan Amount (in thousands, e.g. 150)",
    loan_term: "Loan Term (months, e.g. 360)",
    credit_history: "Credit History (0 = Bad, 1 = Good)",
    property_area: "Property Area (0 = Rural, 1 = Semiurban, 2 = Urban)"
  };

  const currentModel = modelDetails[selectedModel];


  return (
    <div className="max-h-screen bg-gradient-to-br from-slate-100 to-slate-200 p-6">
      <div className="w-full px-4 h-[calc(100vh-3rem)] grid grid-cols-1 lg:grid-cols-2 gap-8">
  
        {/* LEFT PANEL */}
        <div className="bg-white/80 backdrop-blur border border-slate-200 p-8 rounded-2xl shadow-lg h-full overflow-auto">
  
          {/* Model Selection */}
          <div className="mb-8">
            <label className="block font-semibold mb-2 text-slate-700">
              Select Prediction Model
            </label>
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="w-full border p-2 rounded-lg bg-white"
            >
              <option value="neural_network">Neural Network (MLP)</option>
              <option value="svm">Support Vector Machine (SVM)</option>
              <option value="decision_tree">Decision Tree</option>
              <option value="knn">K-Nearest Neighbors (KNN)</option>
            </select>
  
            <p className="text-sm text-gray-600 mt-1">
              Choose a model to compare prediction behavior
            </p>
          </div>
  
          <h2 className="text-3xl font-bold mb-6 text-slate-800">
            Loan Approval Prediction
          </h2>
  
          {/* Input Form */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {Object.keys(form).map((key) => (
              <div key={key} className="flex flex-col">
                <input
                  name={key}
                  placeholder={placeholders[key]}
                  value={form[key]}
                  onChange={handleChange}
                  className={`rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 transition
                    ${
                      errors[key]
                        ? "border-red-400 focus:ring-red-200"
                        : "border-slate-300 focus:ring-blue-200"
                    }
                  `}
                />
                {errors[key] && (
                  <span className="text-xs text-red-500 mt-1">
                    {errors[key]}
                  </span>
                )}
              </div>
            ))}
          </div>
  
          {/* Threshold */}
          <div className="mt-8">
            <div className="flex justify-between mb-2">
              <label className="font-semibold text-slate-700">
                Decision Threshold
              </label>
              <span className="text-sm font-medium text-blue-600">
                {threshold}%
              </span>
            </div>
  
            <input
              type="range"
              min="30"
              max="70"
              value={threshold}
              onChange={(e) => setThreshold(Number(e.target.value))}
              className="w-full accent-blue-600"
            />
  
            <p className="text-xs text-slate-500 mt-2">
              Lower = aggressive · Higher = conservative
            </p>
          </div>
  
          <button
            onClick={predictLoan}
            className="mt-8 w-full rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 font-semibold shadow-md hover:shadow-lg transition"
          >
            Predict Loan Approval
          </button>
        </div>
  
        {/* RIGHT PANEL */}
        <div className="flex flex-col gap-8 h-full">
  
          {/* TOP: MODEL SUMMARY */}
          <div className="bg-white/80 backdrop-blur border border-slate-200 p-6 rounded-2xl shadow-lg">
            <h3 className="text-xl font-semibold mb-4 text-slate-800">
              Model Summary
            </h3>

            <div className="grid grid-cols-2 gap-y-2 text-sm text-slate-700">
              <p><strong>Model:</strong> {currentModel.name}</p>
              <p><strong>Architecture:</strong> {currentModel.layers}</p>
              <p><strong>Activation:</strong> {currentModel.activation}</p>
              <p><strong>Optimizer:</strong> {currentModel.optimizer}</p>
              <p><strong>Accuracy:</strong> {currentModel.accuracy}</p>
              <p><strong>Dataset:</strong> {currentModel.dataset}</p>
            </div>
          </div>  

  
          {/* BOTTOM: RESULT */}
          <div className="bg-white/80 backdrop-blur border border-slate-200 p-6 rounded-2xl shadow-lg flex-1 overflow-auto">
            {probability !== null ? (
              <>
                <h3 className="text-xl font-semibold mb-3 text-slate-800">
                  Prediction Result
                </h3>
  
                <p className="text-lg">
                  Final Decision:{" "}
                  <span
                    className={`font-bold ${
                      finalDecision === "Approved"
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {finalDecision}
                  </span>
                </p>
  
                <p className="mt-1 text-sm text-slate-700">
                  Approval Probability: <strong>{probability}%</strong>
                </p>
  
                <div className="mt-4">
                  <div className="w-full h-3 rounded-full bg-slate-200">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all"
                      style={{ width: `${probability}%` }}
                    />
                  </div>
                </div>
  
                <p className="mt-3 text-sm">
                  Risk Level: <strong>{risk}</strong>
                </p>
  
                {explanations.length > 0 && (
                  <div className="mt-5 rounded-xl border border-blue-200 bg-blue-50 p-4">
                    <h4 className="font-semibold mb-2 text-blue-800">
                      Why this decision?
                    </h4>
                    <ul className="list-disc list-inside text-sm text-blue-900 space-y-1">
                      {explanations.map((reason, idx) => (
                        <li key={idx}>{reason}</li>
                      ))}
                    </ul>
                  </div>
                )}
  
                <p className="text-sm text-gray-600 mt-4">
                  Model Used: <strong>{selectedModel}</strong>
                </p>
              </>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-500 text-sm">
                Enter details and click <strong className="ml-1">Predict</strong>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
  
  
}
