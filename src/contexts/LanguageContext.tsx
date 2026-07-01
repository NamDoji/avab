'use client'
import { createContext, useContext, useState, ReactNode } from 'react'

export type Lang = 'vi' | 'en'

interface LangCtx { lang: Lang; setLang: (l: Lang) => void }
const LanguageContext = createContext<LangCtx>({ lang: 'vi', setLang: () => {} })

export const useLang = () => useContext(LanguageContext)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>('vi')
  return (
    <LanguageContext.Provider value={{ lang, setLang }}>
      {children}
    </LanguageContext.Provider>
  )
}
