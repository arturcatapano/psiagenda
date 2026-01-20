import { useState, useEffect } from 'react'
import { supabase } from './supabase'
import { Trash2, Plus, Calendar, User, Zap, X, UserPlus } from 'lucide-react'

export default function Manager({ session }) {
  const [horarios, setHorarios] = useState([])
  const [loading, setLoading] = useState(false)

  // Estados para o Gerador em Massa
  const [mostrarGerador, setMostrarGerador] = useState(false)
  const [dataAlvo, setDataAlvo] = useState('')
  const [horaInicio, setHoraInicio] = useState('08:00')
  const [horaFim, setHoraFim] = useState('18:00')
  const [duracao] = useState(60) // minutos

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

  // 1. CORREÇÃO DA LÓGICA DE HORAS (Item 1)
  const handleGerarEmMassa = async () => {
    if (!dataAlvo) return alert('Selecione uma data!')

    setLoading(true)
    
    let dataAtual = new Date(`${dataAlvo}T${horaInicio}:00`)
    const dataLimite = new Date(`${dataAlvo}T${horaFim}:00`)
    const novosHorarios = []

    // Mudei de < para <=. Agora o último horário (18h) é incluído.
    while (dataAtual <= dataLimite) {
      novosHorarios.push({
        data_hora: dataAtual.toISOString(),
        status: 'disponivel',
        user_id: session.user.id
      })
      dataAtual.setMinutes(dataAtual.getMinutes() + parseInt(duracao))
    }

    const { error } = await supabase.from('agendamentos').insert(novosHorarios)

    if (error) alert('Erro: ' + error.message)
    else {
      alert(`${novosHorarios.length} horários criados com sucesso!`)
      fetchHorarios()
      setMostrarGerador(false)
    }
    setLoading(false)
  }

  // EXCLUIR (Item 2 - Requer o SQL novo)
  const handleExcluir = async (id) => {
    if(!confirm('Tem certeza que deseja apagar este horário?')) return;
    const { error } = await supabase.from('agendamentos').delete().eq('id', id)
    
    if (error) alert('Erro ao excluir: ' + error.message)
    else fetchHorarios()
  }

  // 3. AGENDAMENTO MANUAL PELO PSICÓLOGO (Item 3)
  const handleAgendarManual = async (id) => {
    const nomePaciente = prompt("Nome do Paciente para este horário:")
    if (!nomePaciente) return

    const { error } = await supabase
      .from('agendamentos')
      .update({ status: 'reservado', cliente_nome: nomePaciente })
      .eq('id', id)

    if (error) alert('Erro: ' + error.message)
    else {
      alert('Agendado manualmente com sucesso!')
      fetchHorarios()
    }
  }

  const formatar = (iso) => new Date(iso).toLocaleString('pt-BR', { 
    day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' 
  })

  return (
    <div className="max-w-4xl mx-auto mt-8 px-4 pb-20">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Gerenciar Agenda</h2>
          <p className="text-sm text-gray-500">
            {horarios.filter(h => h.status === 'reservado').length} sessões agendadas.
          </p>
        </div>
        
        <button 
          onClick={() => setMostrarGerador(!mostrarGerador)}
          className="bg-[#c6444c] text-white px-6 py-3 rounded-xl font-bold hover:shadow-lg transition-all flex items-center gap-2"
        >
          {mostrarGerador ? <X /> : <Zap />}
          {mostrarGerador ? 'Cancelar' : 'Gerador em Massa'}
        </button>
      </div>

      {/* GERADOR */}
      {mostrarGerador && (
        <div className="bg-white p-6 rounded-2xl shadow-xl border border-[#c6444c]/20 mb-10 animate-fade-in-down">
          <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2">
            ⚡ Criar Vários Horários
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 items-end">
            <div>
              <label className="text-xs font-bold text-gray-500">Dia</label>
              <input type="date" className="w-full border p-3 rounded-lg focus:outline-[#c6444c]" value={dataAlvo} onChange={(e) => setDataAlvo(e.target.value)} />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500">Início</label>
              <input type="time" className="w-full border p-3 rounded-lg focus:outline-[#c6444c]" value={horaInicio} onChange={(e) => setHoraInicio(e.target.value)} />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500">Fim</label>
              <input type="time" className="w-full border p-3 rounded-lg focus:outline-[#c6444c]" value={horaFim} onChange={(e) => setHoraFim(e.target.value)} />
            </div>
            <button onClick={handleGerarEmMassa} disabled={loading} className="bg-gray-800 text-white p-3 rounded-lg font-bold hover:bg-black transition-all h-[50px]">
              {loading ? '...' : 'Criar'}
            </button>
          </div>
        </div>
      )}

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
                  {formatar(item.data_hora).split(',')[1]} <span className="text-xs text-gray-400">h</span>
                </span>
                <button onClick={() => handleExcluir(item.id)} className="text-gray-300 hover:text-red-500" title="Excluir horário">
                  <Trash2 size={18} />
                </button>
              </div>

              <div className="text-sm text-gray-500 mb-4 flex items-center gap-2">
                <Calendar size={14} /> {formatar(item.data_hora).split(',')[0]}
              </div>

              {reservado ? (
                <div className="bg-[#fff0f0] p-3 rounded-lg">
                  <p className="text-xs text-[#c6444c] font-bold uppercase mb-1">Paciente:</p>
                  <div className="flex items-center gap-2 text-[#c6444c] font-medium">
                    <User size={16} /> {item.cliente_nome}
                  </div>
                </div>
              ) : (
                <button 
                  onClick={() => handleAgendarManual(item.id)}
                  className="w-full bg-green-50 p-2 rounded-lg text-green-700 font-bold text-sm hover:bg-green-100 transition-colors flex items-center justify-center gap-2"
                >
                  <UserPlus size={16} /> Agendar Paciente
                </button>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}