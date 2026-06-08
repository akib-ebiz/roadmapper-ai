import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

function GrowthChart({ data = [] }) {
  if (!data.length) {
    return <p className="text-sm text-gray-400 text-center py-8">No growth data for this period</p>
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="date" tick={{ fontSize: 10 }} />
        <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="users" stroke="#2563eb" name="Users" strokeWidth={2} />
        <Line type="monotone" dataKey="courses" stroke="#16a34a" name="Courses" strokeWidth={2} />
        <Line type="monotone" dataKey="attempts" stroke="#7c3aed" name="Quiz Attempts" strokeWidth={2} />
      </LineChart>
    </ResponsiveContainer>
  )
}

export default GrowthChart
