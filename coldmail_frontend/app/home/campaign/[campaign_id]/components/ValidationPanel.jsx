export default function ValidationPanel({ validation }) {
    const { blocking_errors, warnings } = validation;
  
    if (
      blocking_errors.length === 0 &&
      warnings.length === 0
    ) {
      return null;
    }
  
    return (
      <div className="card border-l-4 border-yellow-400 bg-yellow-50">
        {blocking_errors.length > 0 && (
          <>
            <p className="font-semibold text-red-600">
              Blocking Issues
            </p>
            <ul className="list-disc ml-5 text-sm">
              {blocking_errors.map((e, i) => (
                <li key={i}>{e}</li>
              ))}
            </ul>
          </>
        )}
  
        {warnings.length > 0 && (
          <>
            <p className="font-semibold text-yellow-700 mt-3">
              Warnings
            </p>
            <ul className="list-disc ml-5 text-sm">
              {warnings.map((w, i) => (
                <li key={i}>{w}</li>
              ))}
            </ul>
          </>
        )}
      </div>
    );
  }
  