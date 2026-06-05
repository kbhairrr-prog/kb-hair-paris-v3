'use client'

import { useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

interface AuthPageProps { locale: 'fr' | 'en' }

export default function AuthPage({ locale }: AuthPageProps) {
  const [mode,     setMode]    = useState<'login' | 'register'>('login')
  const [email,    setEmail]   = useState('')
  const [password, setPassword]= useState('')
  const [firstName,setFirst]   = useState('')
  const [lastName, setLast]    = useState('')
  const [loading,  setLoading] = useState(false)
  const [error,    setError]   = useState('')
  const [success,  setSuccess] = useState('')

  const handleSubmit = async () => {
    setError(''); setLoading(true)
    try {
      if (mode === 'login') {
        const { error: err } = await supabase.auth.signInWithPassword({ email, password })
        if (err) { setError(err.message); return }
        window.location.href = `/${locale}/compte`
      } else {
        const { data, error: err } = await supabase.auth.signUp({
          email, password,
          options: { data: { first_name: firstName, last_name: lastName } },
        })
        if (err) { setError(err.message); return }
        if (data.user) {
          await supabase.from('customers').insert({
            supabase_uid: data.user.id,
            email, first_name: firstName, last_name: lastName, locale,
          })
        }
        setSuccess(locale === 'fr' ? 'Compte créé ! Vérifiez votre email.' : 'Account created! Check your email.')
      }
    } finally {
      setLoading(false)
    }
  }

  const inputCls = "w-full px-3 py-3.5 border border-[#e0e0e0] bg-white font-sans text-[13px] font-light placeholder:text-[#bbb] outline-none focus:border-black transition-colors"

  return (
    <div className="min-h-screen bg-[#f8f8f8] pt-[68px] flex items-center justify-center px-4">
      <div className="w-full max-w-[380px]">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href={`/${locale}`} className="no-underline">
            <span className="font-serif text-[20px] tracking-[0.25em] text-black block">KB HAIR</span>
            <span className="font-serif text-[9px] tracking-[0.4em] text-[#888] block mt-1">PARIS</span>
          </Link>
        </div>

        <div className="bg-white border border-[#e8e8e8] px-6 py-7">
          {/* Tabs */}
          <div className="flex mb-6 border-b border-[#e8e8e8]">
            {(['login', 'register'] as const).map(m => (
              <button
                key={m}
                onClick={() => { setMode(m); setError(''); setSuccess('') }}
                className={`flex-1 py-2.5 font-sans text-[10px] tracking-[0.15em] uppercase border-b-2 transition-colors bg-transparent cursor-pointer ${
                  mode === m ? 'border-b-black text-black' : 'border-b-transparent text-[#aaa]'
                }`}
                style={{ borderBottomWidth: '2px', borderBottomStyle: 'solid' }}
              >
                {m === 'login'
                  ? (locale === 'fr' ? 'Connexion' : 'Sign in')
                  : (locale === 'fr' ? 'Créer un compte' : 'Register')}
              </button>
            ))}
          </div>

          <div className="flex flex-col gap-3">
            {mode === 'register' && (
              <div className="grid grid-cols-2 gap-3">
                <input value={firstName} onChange={e => setFirst(e.target.value)} placeholder={locale === 'fr' ? 'Prénom' : 'First name'} className={inputCls} />
                <input value={lastName}  onChange={e => setLast(e.target.value)}  placeholder={locale === 'fr' ? 'Nom' : 'Last name'}   className={inputCls} />
              </div>
            )}
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" className={inputCls} />
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder={locale === 'fr' ? 'Mot de passe' : 'Password'} className={inputCls} />

            {error   && <p className="font-sans text-[11px] text-red-500">{error}</p>}
            {success && <p className="font-sans text-[11px] text-green-600">{success}</p>}

            <button
              onClick={handleSubmit}
              disabled={loading || !email || !password}
              className="w-full bg-black text-white font-sans text-[11px] font-medium tracking-[0.22em] uppercase py-4 mt-1 border-none cursor-pointer hover:opacity-85 disabled:opacity-50 transition-opacity"
            >
              {loading ? '...' : mode === 'login'
                ? (locale === 'fr' ? 'SE CONNECTER' : 'SIGN IN')
                : (locale === 'fr' ? 'CRÉER MON COMPTE' : 'CREATE ACCOUNT')}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
