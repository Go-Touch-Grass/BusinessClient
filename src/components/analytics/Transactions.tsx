import React, { useEffect, useState } from 'react';
import api from '@/api';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface TransactionData {
  transactionType: string;
  count: string;
}

const Transactions = () => {
  const [transactionData, setTransactionData] = useState<TransactionData[]>([]);
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28'];

  const RADIAN = Math.PI / 180;
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get('/api/business-analytics/transaction-counts');
        setTransactionData(response.data.transactionCounts);
      } catch (error) {
        console.error('Error fetching transaction data:', error);
      }
    };

    fetchData();
  }, []);

  const pieChartData = transactionData.map(item => ({
    name: item.transactionType,
    value: Number(item.count), // Convert to number here
  }));

  console.log('Pie Chart Data:', pieChartData);

  if (pieChartData.length === 0) {
    return <p>No transaction data available</p>;
  }

  return (
    <div style={{ textAlign: 'center', width: '100%', height: '400px' }}>
      <h2>Transaction Summary</h2>
      <ResponsiveContainer width="100%" height={400}>
        <PieChart>
          <Pie
            data={pieChartData}
            cx="50%"
            cy="50%"
            outerRadius={150}
            labelLine={false}
            label={renderCustomizedLabel}
            fill="#8884d8"
            dataKey="value"
          >
            {pieChartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default Transactions;
