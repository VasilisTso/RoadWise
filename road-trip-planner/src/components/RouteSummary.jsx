import React from "react";

function RouteSummary({ summary }) {
  if (!summary || !summary.distance) return null; // hide if no route

  console.log("RouteSummary:", summary);
  
  return (
    <div className="route-box mt-6 p-4 border rounded bg-gray-50">
      <h2 className="text-xl font-semibold mb-3">Route Summary</h2>

      <p><strong>From:</strong> {summary.start}</p>
      <p><strong>To:</strong> {summary.end}</p>
      <p><strong>Distance:</strong> {summary.distance}</p>
      <p>
        <strong>Duration:</strong>{" "}
        {(() => {
          const [hours, minutes] = convertToHoursAndMinutes(summary.duration);
          return `${hours}h ${minutes}min`;
        })()}
      </p>
      <p><strong>Fuel Cost:</strong> €{summary.fuelCost}</p>
      <p><strong>Toll Cost:</strong> €{summary.tollCost}</p>
      <p><strong>Total Cost:</strong> €{summary.cost}</p>
      <p><strong>Cost per Passenger:</strong> €{summary.perPassenger}</p>
    </div>
  );
}

// Utility function to convert decimal minutes to h + min
function convertToHoursAndMinutes(minsString) {
  const mins = parseFloat(minsString);
  const hours = Math.floor(mins / 60);
  const minutes = Math.round(mins % 60);
  return [hours, minutes];
}

export default RouteSummary;
