'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function AdminLogin() {
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [error,    setError]    = useState('')
  const [loading,  setLoading]  = useState(false)

  const handleLogin = async () => {
    setError('')
    setLoading(true)
    const { error: err } = await supabase.auth.signInWithPassword({ email, password })
    if (err) {
      setError(err.message)
      setLoading(false)
      return
    }
    window.location.replace('/admin')
  }

  return (
    <div className="min-h-screen bg-[#1a1a1a] flex items-center justify-center px-4">
      <div className="w-full max-w-[340px]">
        <div className="text-center mb-8">
          <span className="font-serif text-[20px] tracking-[0.25em] text-white block">KB HAIR</span>
          <span className="font-sans text-[9px] tracking-[0.4em] uppercase text-white/40 block mt-1">ADMIN</span>
        </div>
        <div className="flex flex-col gap-3">
          <input type="email" value={email} onChange={e => setEmail(e.target.value)}
            placeholder="Email administrateur"
            className="w-full px-4 py-3.5 bg-white/5 border border-white/10 text-white font-sans text-[13px] placeholder:text-white/30 outline-none focus:border-white/30"
          />
          <input type="password" value={password} onChange={e => setPassword(e.target.value)}
            placeholder="Mot de passe"
            className="w-full px-4 py-3.5 bg-white/5 border border-white/10 text-white font-sans text-[13px] placeholder:text-white/30 outline-none focus:border-white/30"
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
          />
          {error && <p className="font-sans text-[11px] text-red-400">{error}</p>}
          <button onClick={handleLogin} disabled={loading || !email || !password}
            className="w-full bg-white text-black font-sans text-[11px] font-medium tracking-[0.22em] uppercase py-4 border-none cursor-pointer hover:opacity-85 disabled:opacity-40 transition-opacity mt-1">
            {loading ? '...' : 'SE CONNECTER'}
          </button>
        </div>
      </div>
    </div>
  )
}
