export function StatsSection() {
  const stats = [
    { value: '590+', label: 'Thành viên tham gia / năm', emoji: '👨‍👩‍👧‍👦', color: 'from-purple-500 to-purple-700' },
    { value: '330', label: 'Học viên mua khoá học', emoji: '📖', color: 'from-teal-400 to-teal-600' },
    { value: '490+M', label: 'Doanh thu năm đỉnh (VND)', emoji: '💰', color: 'from-orange-400 to-orange-600' },
    { value: '3+', label: 'Năm học hoạt động', emoji: '📅', color: 'from-pink-500 to-pink-700' },
  ]

  return (
    <section className="py-16 bg-white">
      <div className="container-custom">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="relative overflow-hidden rounded-3xl p-6 text-center card-hover shadow-md"
              style={{ background: 'linear-gradient(135deg, #F5F3FF, #EDE9FE)' }}
            >
              <div className="text-4xl mb-2">{stat.emoji}</div>
              <div className={`text-3xl md:text-4xl font-black bg-gradient-to-br ${stat.color} bg-clip-text text-transparent`}>
                {stat.value}
              </div>
              <div className="text-gray-600 text-sm mt-1 font-medium">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
