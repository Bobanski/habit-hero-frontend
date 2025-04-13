// src/components/LineChart.jsx
import React from "react";
import { LineChart as ReLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const LineChart = ({ data, title }) => {
  return (
    <div className="rounded-lg bg-white p-4 shadow-md">
      <h3 className="font-bold text-lg mb-2">{title}</h3>
      <div className="w-full h-64">
        <ResponsiveContainer width="100%" height="100%">
          <ReLineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="label" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} />
          </ReLineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default LineChart;
