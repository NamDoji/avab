'use client'

import { Brain, Sparkles } from 'lucide-react'
import { useLang } from '@/contexts/LanguageContext'
import { AIDashboard } from './AIDashboard'
import { LearnerProfileCard } from './LearnerProfileCard'

interface Props {
  userId: string
  userName: string
}

const content = {
  vi: {
    badge: 'BKT · DKT · Recommender Systems — AvaB AI',
    title: 'AI Hỗ Trợ Học Tập',
    subtitle: (name: string) => `Phân tích đa chiều theo framework AI giáo dục — chẩn đoán trạng thái, dự báo tiến trình, lựa chọn can thiệp và khuyến nghị sư phạm riêng cho `,
    features: [
      { icon: '🔬', title: 'Chẩn đoán trạng thái người học', desc: 'Mô hình hóa tri thức theo hướng BKT/DKT — bản đồ kiến thức, hành vi học tập, mức gắn kết và tải nhận thức.' },
      { icon: '📡', title: 'Dự báo tiến trình học tập', desc: 'Dự báo đa chiều: xác suất thành công, rủi ro gắn kết, tải nhận thức, mức sẵn sàng tiếp theo (DKT/Transformer).' },
      { icon: '🎯', title: 'Lựa chọn gói can thiệp', desc: 'Recommender system đề xuất gói can thiệp tối ưu: lộ trình cá nhân, phương pháp, thời gian ước tính.' },
      { icon: '💡', title: 'Khuyến nghị can thiệp sư phạm', desc: 'Aware recommendation: chiến lược dạy học, mức hỗ trợ, hướng dẫn phụ huynh — tính toàn diện.' },
    ],
    note: '🤖 AI phân tích dựa trên dữ liệu làm bài thực tế. Kết quả chính xác hơn khi làm nhiều bài hơn. Đây là AI hỗ trợ — không thay thế đánh giá của giáo viên.',
  },
  en: {
    badge: 'BKT · DKT · Recommender Systems — AvaB AI',
    title: 'AI Learning Support',
    subtitle: (name: string) => `Multi-dimensional AI analysis based on educational AI framework — diagnosis, prediction, intervention selection and personalised pedagogical guidance for `,
    features: [
      { icon: '🔬', title: 'Learner State Diagnosis', desc: 'BKT/DKT-inspired knowledge modelling — knowledge map, learning behaviour, engagement level, and cognitive load.' },
      { icon: '📡', title: 'Learning Progress Prediction', desc: 'Multi-task prediction: success probability, engagement risk, cognitive load, readiness to advance (DKT/Transformer).' },
      { icon: '🎯', title: 'Intervention Package Selection', desc: 'Recommender system selects the optimal intervention package: personalised pathway, method, and estimated timeline.' },
      { icon: '💡', title: 'Pedagogical Intervention', desc: 'Aware recommendation: teaching strategy, support intensity, parent guidance — comprehensive and actionable.' },
    ],
    note: '🤖 AI analysis is based on actual practice data. Results improve with more exercises. This is AI support — not a replacement for teacher assessment.',
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
        {/* 4 bài toán AI giáo dục */}
        <div className="grid sm:grid-cols-2 gap-4 mb-8">
          {t.features.map((f, i) => (
            <div key={f.title} className="bg-white rounded-3xl p-5 border border-purple-50 shadow-sm flex gap-3">
              <span className="text-3xl shrink-0">{f.icon}</span>
              <div>
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="text-xs font-bold text-purple-400 bg-purple-50 px-2 py-0.5 rounded-full">
                    Bài toán {i + 1}
                  </span>
                </div>
                <h3 className="font-bold text-gray-900 text-sm mb-1">{f.title}</h3>
                <p className="text-gray-500 text-xs leading-relaxed">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <LearnerProfileCard />
        <AIDashboard userId={userId} />

        <div className="mt-6 text-center text-gray-400 text-xs">{t.note}</div>
      </div>
    </div>
  )
}
