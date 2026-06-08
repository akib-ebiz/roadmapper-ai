import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

function EnrollmentChart({ data = [] }) {
  if (!data.length) {
    return <p className="text-sm text-gray-400 text-center py-8">No enrollment data yet</p>
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="name" tick={{ fontSize: 10 }} />
        <YAxis tick={{ fontSize: 11 }} />
        <Tooltip />
        <Legend />
        <Bar dataKey="enrollments" fill="#2563eb" name="Enrollments" radius={[4, 4, 0, 0]} />
        <Bar dataKey="completionRate" fill="#16a34a" name="Completion %" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}

export default EnrollmentChart
