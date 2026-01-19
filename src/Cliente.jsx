import { useState, useEffect } from 'react'
import { supabase } from './supabase'
import { Calendar, Clock, User, CheckCircle } from 'lucide-react' // Se der erro, instale: npm i lucide-react

export default function Cliente() {
  const [horarios, setHorarios] = useState([])
  const [nome, setNome] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchDisponiveis()
  }, [])

  const fetchDisponiveis = async () => {
    const { data } = await supabase
      .from('agendamentos')
      .select('*')
      .eq('status', 'disponivel')
      .order('data_hora', { ascending: true })
    setHorarios(data || [])
  }

  const handleAgendar = async (id) => {
    if (!nome) return alert('Por favor, digite seu nome para continuar.')
    
    if(!window.confirm('Confirmar o agendamento neste horário?')) return;

    setLoading(true)
    const { error } = await supabase
      .from('agendamentos')
      .update({ status: 'reservado', cliente_nome: nome })
      .eq('id', id)

    if (error) alert('Erro: ' + error.message)
    else {
      alert('Agendamento confirmado! Te espero lá.')
      fetchDisponiveis()
      setNome('')
    }
    setLoading(false)
  }

  const formatarData = (iso) => {
    const d = new Date(iso)
    return {
      dia: d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' }),
      hora: d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#efc9c1] to-[#fff9f9] py-12 px-4">
      <div className="max-w-md mx-auto bg-white rounded-3xl shadow-2xl overflow-hidden">
        
        {/* Cabeçalho */}
        <div className="bg-[#c6444c] p-6 text-center">
          <h1 className="text-2xl font-bold text-white flex items-center justify-center gap-2">
            <Calendar className="w-6 h-6" /> Agendar Sessão
          </h1>
          <p className="text-white/80 text-sm mt-1">Selecione o melhor horário para você.</p>
        </div>

        <div className="p-8">
          {/* Input do Nome */}
          <div className="mb-8">
            <label className="flex items-center gap-2 text-sm font-bold text-gray-600 mb-2">
              <User size={18} /> Seu Nome Completo
            </label>
            <input 
              type="text" 
              className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#c6444c] focus:bg-white transition-all"
              placeholder="Ex: João da Silva"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
            />
          </div>

          {/* Grid de Horários */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Horários Disponíveis</h3>
            
            {horarios.length === 0 ? (
              <div className="text-center py-10 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                <p className="text-gray-400">Nenhuma vaga disponível no momento.</p>
              </div>
            ) : (
              <div className="grid gap-3">
                {horarios.map((item) => {
                  const { dia, hora } = formatarData(item.data_hora)
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleAgendar(item.id)}
                      disabled={loading}
                      className="group flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:border-[#c6444c] hover:bg-[#fff0f0] active:scale-95 transition-all text-left w-full bg-white shadow-sm"
                    >
                      <div>
                        <p className="font-bold text-gray-800 group-hover:text-[#c6444c]">{dia}</p>
                        <p className="text-sm text-gray-500 flex items-center gap-1">
                          <Clock size={14} /> {hora}
                        </p>
                      </div>
                      <div className="bg-gray-100 text-gray-400 p-2 rounded-full group-hover:bg-[#c6444c] group-hover:text-white transition-colors">
                        <CheckCircle size={20} />
                      </div>
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        </div>
        
        {/* Rodapé decorativo */}
        <div className="bg-gray-50 p-4 text-center text-xs text-gray-400">
          Psicologia Clínica & Organizacional
        </div>
      </div>
    </div>
  )
}