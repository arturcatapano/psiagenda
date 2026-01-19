import { useState } from 'react'
import { supabase } from './supabase'

export default function Auth() {
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    // Tenta fazer login
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    
    if (error) {
      // Se der erro (ex: usuário não existe), tenta cadastrar automaticamente?
      // Para simplificar, vamos avisar o erro. 
      // Num SaaS real, teríamos botões separados ou fluxo de cadastro.
      alert('Erro ao entrar: ' + error.message)
    } 
    setLoading(false)
  }

  const handleSignUp = async (e) => {
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase.auth.signUp({ email, password })
    
    if (error) alert('Erro no cadastro: ' + error.message)
    else alert('Verifique seu e-mail para confirmar o cadastro!')
    
    setLoading(false)
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#efc9c1] p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
        <h1 className="text-3xl font-bold text-[#c6444c] mb-2 text-center">PsiAgenda</h1>
        <p className="text-gray-500 mb-8 text-center">Gerencie seus pacientes e horários.</p>
        
        <form className="flex flex-col gap-4">
          <input
            className="p-3 border rounded-lg focus:outline-[#c6444c]"
            type="email"
            placeholder="Seu e-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            className="p-3 border rounded-lg focus:outline-[#c6444c]"
            type="password"
            placeholder="Sua senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          
          <button
            onClick={handleLogin}
            disabled={loading}
            className="bg-[#c6444c] text-white font-bold p-3 rounded-lg hover:opacity-90 transition-all"
          >
            {loading ? 'Carregando...' : 'Entrar'}
          </button>
          
          <button
            onClick={handleSignUp}
            disabled={loading}
            className="text-[#c6444c] text-sm hover:underline mt-2"
          >
            Não tem conta? Cadastrar
          </button>
        </form>
      </div>
    </div>
  )
}