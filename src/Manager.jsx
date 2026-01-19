import { useState, useEffect } from 'react'
import { supabase } from './supabase'
import { Trash2, Plus, Calendar, User } from 'lucide-react'

export default function Manager({ session }) {
  const [horarios, setHorarios] = useState([])
  const [novoHorario, setNovoHorario] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchHorarios()
  }, [])

  const fetchHorarios = async () => {
    const { data } = await supabase
      .from('agendamentos')
      .select('*')
      .order('data_hora', { ascending: true })
    if (data) setHorarios(data)
  }

  const handleAdicionar = async () => {
    if (!novoHorario) return alert('Escolha uma data!')
    setLoading(true)
    const { error } = await supabase
      .from('agendamentos')
      .insert([{ 
        data_hora: new Date(novoHorario).toISOString(), 
        status: 'disponivel',
        user_id: session.user.id 
      }])
    
    if (error) alert(error.message)
    else {
      fetchHorarios()
      setNovoHorario('') // Limpa o campo
    }
    setLoading(false)
  }

  const handleExcluir = async (id) => {
    if(!confirm('Tem certeza que deseja apagar este horário?')) return;
    const { error } = await supabase.from('agendamentos').delete().eq('id', id)
    if (!error) fetchHorarios()
  }

  const formatar = (iso) => new Date(iso).toLocaleString('pt-BR', { 
    day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' 
  })

  return (
    <div className="max-w-4xl mx-auto mt-8 px-4 pb-20">
      
      {/* HEADER DE AÇÃO */}
      <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 flex flex-col md:flex-row items-center justify-between gap-4 mb-10">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Gerenciar Agenda</h2>
          <p className="text-sm text-gray-500">Abra novos horários para seus pacientes.</p>
        </div>
        
        <div className="flex gap-2 w-full md:w-auto">
          <input 
            type="datetime-local" 
            className="border border-gray-300 p-3 rounded-xl focus:outline-none focus:border-[#c6444c] flex-1"
            value={novoHorario}
            onChange={(e) => setNovoHorario(e.target.value)}
          />
          <button 
            onClick={handleAdicionar}
            disabled={loading}
            className="bg-[#c6444c] text-white px-6 py-3 rounded-xl font-bold hover:brightness-90 flex items-center gap-2 shadow-md hover:shadow-lg transition-all"
          >
            <Plus size={20} />
            <span className="hidden md:inline">Adicionar</span>
          </button>
        </div>
      </div>

      {/* LISTAGEM */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {horarios.map((item) => {
          const reservado = item.status === 'reservado'
          
          return (
            <div key={item.id} className={`relative p-5 rounded-2xl border transition-all hover:shadow-md ${
              reservado ? 'bg-white border-[#c6444c] border-l-8' : 'bg-white border-gray-200 border-l-8 border-l-green-400'
            }`}>
              
              <div className="flex justify-between items-start mb-3">
                <span className="text-2xl font-bold text-gray-700 block">
                  {formatar(item.data_hora).split(',')[1]} 
                  <span className="text-xs font-normal text-gray-400 ml-1">h</span>
                </span>
                <button onClick={() => handleExcluir(item.id)} className="text-gray-300 hover:text-red-500">
                  <Trash2 size={18} />
                </button>
              </div>

              <div className="text-sm text-gray-500 mb-4 flex items-center gap-2">
                <Calendar size={14} /> {formatar(item.data_hora).split(',')[0]}
              </div>

              {reservado ? (
                <div className="bg-[#fff0f0] p-3 rounded-lg">
                  <p className="text-xs text-[#c6444c] font-bold uppercase mb-1">Reservado por:</p>
                  <div className="flex items-center gap-2 text-[#c6444c] font-medium">
                    <User size={16} /> {item.cliente_nome}
                  </div>
                </div>
              ) : (
                <div className="bg-green-50 p-2 rounded-lg text-center">
                  <p className="text-xs text-green-600 font-bold uppercase">Disponível</p>
                </div>
              )}

            </div>
          )
        })}
      </div>
    </div>
  )
}