'use client'

import { Brain, Sparkles } from 'lucide-react'
import { useLang } from '@/contexts/LanguageContext'
import { AIDashboard } from './AIDashboard'

interface Props {
  userId: string
  userName: string
}

const content = {
  vi: {
    badge: 'Powered by GPT-4o — AvaB AI',
    title: 'AI Hỗ Trợ Học Tập',
    subtitle: (name: string) => `Trợ lý AI phân tích cá nhân — không phải thống kê chung chung, mà là nhận xét riêng dành cho ${name}.`,
    features: [
      { icon: '🎯', title: 'AI Đánh giá khả năng đỗ', desc: 'Phân tích toàn bộ kết quả học tập, đưa ra xác suất đỗ học bổng và kế hoạch cải thiện cụ thể.' },
      { icon: '🔍', title: 'AI Phân tích lỗi sai', desc: 'Nhận dạng dạng toán học sinh hay mắc lỗi, tìm ra nguyên nhân và đề xuất cách khắc phục.' },
      { icon: '🗺️', title: 'AI Cá nhân hoá lộ trình', desc: 'Dựa trên năng lực thực tế, AI xây dựng kế hoạch học theo tuần, ưu tiên đúng chuyên đề.' },
      { icon: '💡', title: 'AI Gợi ý bài tập', desc: 'Đề xuất bài tập phù hợp với trình độ hiện tại, không quá dễ nhàm, không quá khó nản.' },
    ],
    note: '🤖 AI phân tích dựa trên dữ liệu làm bài thực tế của bạn. Kết quả chính xác hơn khi bạn làm nhiều câu hỏi hơn.',
  },
  en: {
    badge: 'Powered by GPT-4o — AvaB AI',
    title: 'AI Learning Assistant',
    subtitle: (name: string) => `Personal AI analysis — not generic statistics, but insights tailored specifically for ${name}.`,
    features: [
      { icon: '🎯', title: 'AI Admission Prediction', desc: 'Analyzes your full learning history to predict scholarship chances and suggest a concrete improvement plan.' },
      { icon: '🔍', title: 'AI Error Analysis', desc: 'Identifies recurring mistake patterns, finds root causes, and recommends targeted remediation strategies.' },
      { icon: '🗺️', title: 'AI Personalised Pathway', desc: 'Based on actual performance, AI builds a week-by-week study plan prioritising the right topics.' },
      { icon: '💡', title: 'AI Exercise Suggestions', desc: 'Recommends exercises matched to current level — not too easy to bore, not too hard to discourage.' },
    ],
    note: '🤖 AI analysis is based on your actual practice data. Results improve as you complete more questions.',
  },
}

export function AIPageContent({ userId, userName }: Props) {
  const { lang } = useLang()
  const t = content[lang]

  return (
    <div className="min-h-screen pt-20 bg-gradient-to-br from-purple-50 via-white to-teal-50">
      {/* Hero */}
      <div className="gradient-hero text-white py-14">
        <div className="container-custom text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-2 mb-5">
            <Sparkles size={14} className="text-yellow-400" />
            <span className="text-sm font-semibold">{t.badge}</span>
          </div>
          <Brain className="mx-auto mb-3 text-teal-300" size={48} />
          <h1 className="text-3xl md:text-5xl font-black mb-4">{t.title}</h1>
          <p className="text-white/80 max-w-2xl mx-auto text-base md:text-lg">
            {t.subtitle('')}<strong className="text-yellow-300">{userName}</strong>.
          </p>
        </div>
      </div>

      <div className="container-custom py-12 max-w-4xl">
        {/* Feature cards */}
        <div className="grid sm:grid-cols-2 gap-4 mb-8">
          {t.features.map((f) => (
            <div key={f.title} className="bg-white rounded-3xl p-5 border border-purple-50 shadow-sm flex gap-3">
              <span className="text-3xl shrink-0">{f.icon}</span>
              <div>
                <h3 className="font-bold text-gray-900 text-sm mb-1">{f.title}</h3>
                <p className="text-gray-500 text-xs leading-relaxed">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <AIDashboard userId={userId} />

        <div className="mt-6 text-center text-gray-400 text-xs">{t.note}</div>
      </div>
    </div>
  )
}
