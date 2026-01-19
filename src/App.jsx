import { useState, useEffect } from 'react'
import { supabase } from './supabase'
import Auth from './auth'
import Manager from './Manager'

export default function App() {
  const [session, setSession] = useState(null)

  useEffect(() => {
    // 1. Verifica se já existe uma sessão ativa ao abrir o site
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    // 2. Fica "ouvindo" mudanças (Login, Logout)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  // SE NÃO TIVER SESSÃO -> MOSTRA TELA DE LOGIN
  if (!session) {
    return <Auth />
  }

  // SE TIVER SESSÃO -> MOSTRA O DASHBOARD (O SAAS)
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-[#efc9c1] p-4 flex justify-between items-center shadow-md">
        <h1 className="text-xl font-bold text-[#c6444c]">Psi Agenda Painel</h1>
        <button 
          onClick={() => supabase.auth.signOut()} 
          className="bg-white text-[#c6444c] px-4 py-2 rounded-lg font-bold hover:bg-gray-100"
        >
          Sair
        </button>
      </nav>

      <div className="max-w-4xl mx-auto p-8">
        <h2 className="text-2xl font-bold text-gray-800">
          Bem-vinda, {session.user.email}
        </h2>
        <p className="mt-4 text-gray-600">
          Aqui será a área de gestão de horários.
        </p>
        
        {/* AQUI ENTRARÁ O PRÓXIMO PASSO: O CRUD DE HORÁRIOS */}
        {/* Passamos a 'session' para o Manager saber quem é o usuário logado */}
          <Manager session={session} />
      </div>
    </div>
  )
}