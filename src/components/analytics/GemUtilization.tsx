import React, { useEffect, useState } from 'react';
import api from '@/api';
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from 'recharts';
import { format, parseISO } from 'date-fns';

interface Transaction {
  gems_deducted: number;
  transaction_date: string;
}

const GemUtilization = () => {
  const [data, setData] = useState([]);

  // Fetch gem utilization data from the backend
  useEffect(() => {
    const fetchGemUtilization = async () => {
      try {
        const response = await api.get('/api/business-analytics/gem-utilization');
        setData(response.data);
      } catch (error) {
        console.error("Error fetching gem utilization data:", error);
      }
    };

    fetchGemUtilization();
  }, []);

  // Function to aggregate transactions by month
  const aggregateDataByMonth = (transactions: Transaction[]) => {
    const monthlyData: { [key: string]: number } = {};

    transactions.forEach(({ gems_deducted, transaction_date }) => {
      const month = format(parseISO(transaction_date), 'yyyy-MM');
      monthlyData[month] = (monthlyData[month] || 0) + gems_deducted;
    });
    
    // Convert the object to an array of objects suitable for Recharts
    return Object.entries(monthlyData).map(([month, gemsSpent]) => ({
      month,
      gemsSpent,
    }));
  };

  const chartData = aggregateDataByMonth(data);

  return (
    <div style={{ textAlign: 'center', width: '100%', height: '400px' }}>
      <h1>Gem Utilization</h1>
      {chartData.length > 0 ? (
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="gemsSpent" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <p>No data available for the past year.</p>
      )}
    </div>
  );
}

export default GemUtilization;
