import { useState } from "react";

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
    setProbability(prob);

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

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-xl rounded-xl">
      <h2 className="text-2xl font-bold mb-6 text-center">
        Loan Approval Prediction (Neural Network)
      </h2>

      {/* Model Summary Card */}
      <div className="mb-6 p-4 bg-gray-50 border rounded-lg">
        <h3 className="text-lg font-semibold mb-2">Model Summary</h3>
        <div className="grid grid-cols-2 gap-2 text-sm text-gray-700">
          <p><strong>Model:</strong> {modelInfo.name}</p>
          <p><strong>Architecture:</strong> {modelInfo.layers}</p>
          <p><strong>Activation:</strong> {modelInfo.activation}</p>
          <p><strong>Optimizer:</strong> {modelInfo.optimizer}</p>
          <p><strong>Accuracy:</strong> {modelInfo.accuracy}</p>
          <p><strong>Dataset:</strong> {modelInfo.dataset}</p>
        </div>
      </div>


      {/* Input Form */}
      <div className="grid grid-cols-2 gap-4">
        {Object.keys(form).map((key) => (
          <div key={key} className="flex flex-col">
          <input
            name={key}
            placeholder={placeholders[key]}
            value={form[key]}
            onChange={handleChange}
            className={`border p-2 rounded focus:ring-2 focus:ring-blue-500 ${
              errors[key] ? "border-red-500" : ""
            }`}
          />
          {errors[key] && (
            <span className="text-xs text-red-500 mt-1">
              {errors[key]}
            </span>
          )}
        </div>        
        ))}
      </div>

      {/* Threshold Slider */}
      <div className="mt-6">
        <label className="font-semibold">
          Decision Threshold: {threshold}%
        </label>
        <input
          type="range"
          min="30"
          max="70"
          step="1"
          value={threshold}
          onChange={(e) => setThreshold(Number(e.target.value))}
          className="w-full mt-2"
        />
        <p className="text-sm text-gray-600 mt-1">
          Lower threshold → aggressive approvals  
          Higher threshold → conservative approvals
        </p>
      </div>

      {/* Predict Button */}
      <button
      onClick={predictLoan}
      className={`mt-6 w-full p-3 rounded text-white ${
        Object.keys(errors).length > 0
          ? "bg-gray-400 cursor-not-allowed"
          : "bg-blue-600 hover:bg-blue-700"
        }`}
      >
        Predict Loan Approval
      </button> 


      {/* Result */}
      {probability !== null && (
        <div className="mt-6 p-5 bg-gray-50 rounded">
          <p className="text-lg font-semibold">
            Final Decision:{" "}
            <span
              className={
                finalDecision === "Approved"
                  ? "text-green-600"
                  : "text-red-600"
              }
            >
              {finalDecision}
            </span>
          </p>

          <p className="mt-2">
            Approval Probability:{" "}
            <span className="font-bold">{probability}%</span>
          </p>

          <p className="mt-1 text-sm text-gray-700">
            Risk Level: <span className="font-semibold">{risk}</span>
          </p>

          {/* Probability Bar */}
          <div className="mt-3">
            <div className="w-full bg-gray-200 rounded h-3">
              <div
                className="bg-blue-600 h-3 rounded"
                style={{ width: `${probability}%` }}
              ></div>
            </div>
          </div>
        </div>
      )}

      {explanations.length > 0 && (
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded">
          <h3 className="font-semibold text-blue-800 mb-2">
            Why this decision?
          </h3>
          <ul className="list-disc list-inside text-sm text-blue-700">
            {explanations.map((reason, index) => (
              <li key={index}>{reason}</li>
            ))}
          </ul>
        </div>
      )}

    </div>
  );
}
