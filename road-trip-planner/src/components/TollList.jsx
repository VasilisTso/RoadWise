import React from 'react';

function TollList({ tolls }) {
  return (
    <div className="toll-info mt-6">
      <h2 className="text-xl font-semibold mb-2">Toll Information</h2>
      
      {tolls.length === 0 ? (
        <p>No tolls on this route.</p>
      ) : (
        <table className="w-full border">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-2">Location</th>
              <th className="border p-2">Bike (€)</th>
              <th className="border p-2">Car (€)</th>
            </tr>
          </thead>
          <tbody>
            {tolls.map((toll, index) => (
              <tr key={index}>
                <td className="border p-2">{toll.name}</td>
                <td className="border p-2">{toll.bike.toFixed(2)}</td>
                <td className="border p-2">{toll.car.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default TollList;