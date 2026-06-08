import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

function AIUsageChart({ data }) {
  if (!data) {
    return <p className="text-sm text-gray-400 text-center py-8">No AI usage data</p>
  }

  const chartData = [
    { name: 'AI Courses', value: data.aiGeneratedCourses || 0 },
    { name: 'Quizzes', value: data.totalQuizzesGenerated || 0 },
  ]

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="name" tick={{ fontSize: 11 }} />
        <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
        <Tooltip />
        <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}

export default AIUsageChart
