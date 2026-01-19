export default function CompareModels() {
  const baseUrl = "http://127.0.0.1:8000/static/comparisons";

  const charts = [
    {
      title: "Model Accuracy Comparison",
      desc: "Overall accuracy of each model on the same test dataset.",
      img: `${baseUrl}/accuracy_comparison.png`
    },
    {
      title: "ROC Curve Comparison",
      desc: "ROC curves showing trade-off between true positive and false positive rates.",
      img: `${baseUrl}/roc_comparison.png`
    },
    {
      title: "Precision–Recall Curve",
      desc: "Precision vs Recall comparison, useful for imbalanced datasets.",
      img: `${baseUrl}/precision_recall_comparison.png`
    },
    {
      title: "Confusion Matrices",
      desc: "Actual vs predicted classifications for each model.",
      img: `${baseUrl}/confusion_matrices.png`
    },
    {
      title: "Prediction Probability Distribution",
      desc: "Distribution of approval probabilities predicted by each model.",
      img: `${baseUrl}/probability_distribution.png`
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 p-8">
      <div className="max-w-6xl mx-auto">

        <h1 className="text-3xl font-bold mb-6 text-slate-800">
          Model Comparison Dashboard
        </h1>

        <p className="text-slate-600 mb-10">
          This page compares multiple machine learning models trained on the same
          loan approval dataset using standard evaluation metrics.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {charts.map((chart, idx) => (
            <div
              key={idx}
              className="bg-white/80 backdrop-blur border border-slate-200 p-6 rounded-2xl shadow-lg"
            >
              <h3 className="text-lg font-semibold text-slate-800 mb-1">
                {chart.title}
              </h3>
              <p className="text-sm text-slate-600 mb-4">
                {chart.desc}
              </p>

              <img
                src={chart.img}
                alt={chart.title}
                className="w-full rounded-lg border"
              />
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
