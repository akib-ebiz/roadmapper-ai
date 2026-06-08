function CompletionBadge({ completed, label }) {
  if (completed) {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
        ✓ {label || 'Completed'}
      </span>
    )
  }

  return (
    <span className="inline-flex items-center gap-1 text-xs font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
      {label || 'In progress'}
    </span>
  )
}

export default CompletionBadge
