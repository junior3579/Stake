import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Plus, Users, Coins, MessageCircle } from 'lucide-react'
import OnlineUsers from './OnlineUsers'

const UserDashboard = ({ user }) => {
  const [salas, setSalas] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [saldoAtual, setSaldoAtual] = useState(user.pontos)

  // Estados para criar sala
  const [novaSala, setNovaSala] = useState({
    nome_sala: '',
    valor_inicial: '',
    whatsapp: ''
  })

  useEffect(() => {
    carregarSalas()
  }, [])

  const carregarSalas = async () => {
    try {
      const response = await fetch('/api/salas')
      const data = await response.json()
      setSalas(data)
    } catch (err) {
      setError('Erro ao carregar salas')
    }
  }

  const criarSala = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const response = await fetch('/api/salas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...novaSala,
          criador: user.nome
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess(data.message)
        setSaldoAtual(data.novos_pontos)
        setNovaSala({ nome_sala: '', valor_inicial: '', whatsapp: '' })
        carregarSalas()
      } else {
        setError(data.error)
      }
    } catch (err) {
      setError('Erro de conexão')
    } finally {
      setLoading(false)
    }
  }

  const entrarNaSala = async (idSala) => {
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const response = await fetch(`/api/salas/${idSala}/entrar`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id_usuario: user.id,
          nome_usuario: user.nome
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess(data.message)
        setSaldoAtual(data.novos_pontos)
        carregarSalas()
      } else {
        setError(data.error)
      }
    } catch (err) {
      setError('Erro de conexão')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Saldo atual e usuários online */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <Coins className="h-8 w-8 text-yellow-500" />
              <div>
                <p className="text-sm text-gray-400">Saldo atual</p>
                <p className="text-2xl font-bold text-white">{saldoAtual} pontos</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <OnlineUsers />
      </div>

      {/* Alertas */}
      {error && (
        <Alert className="bg-red-900 border-red-700">
          <AlertDescription className="text-red-300">{error}</AlertDescription>
        </Alert>
      )}
      {success && (
        <Alert className="bg-green-900 border-green-700">
          <AlertDescription className="text-green-300">{success}</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="salas" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-transparent">
          <TabsTrigger value="salas" className="text-gray-300 data-[state=active]:text-white">
            Salas Disponíveis
          </TabsTrigger>
          <TabsTrigger value="criar" className="text-gray-300 data-[state=active]:text-white">
            Criar Sala
          </TabsTrigger>
        </TabsList>

        <TabsContent value="salas" className="space-y-4">
          <div className="grid gap-4">
            {salas.length === 0 ? (
              <Card className="bg-gray-800 border-gray-700">
                <CardContent className="p-6 text-center">
                  <p className="text-gray-400">Nenhuma sala disponível</p>
                </CardContent>
              </Card>
            ) : (
              salas.map((sala) => (
                <Card key={sala.id_sala} className="bg-gray-800 border-gray-700">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-white">{sala.nome_sala}</CardTitle>
                      <Badge variant="secondary" className="bg-blue-900 text-blue-300">
                        {sala.valor_inicial} pontos
                      </Badge>
                    </div>
                    <CardDescription className="text-gray-400">
                      Criado por: {sala.criador}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <Users className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-300">
                          {Object.keys(sala.jogadores).length} jogador(es)
                        </span>
                      </div>
                      
                      {Object.keys(sala.jogadores).length > 0 && (
                        <div className="space-y-2">
                          <p className="text-sm font-medium text-gray-300">Jogadores:</p>
                          {Object.entries(sala.jogadores).map(([nome, whatsapp]) => (
                            <div key={nome} className="flex items-center justify-between text-sm">
                              <span className="text-gray-400">{nome}</span>
                              {whatsapp && whatsapp !== 'Não cadastrado' && (
                                <div className="flex items-center space-x-1">
                                  <MessageCircle className="h-3 w-3 text-green-500" />
                                  <span className="text-green-400">{whatsapp}</span>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                      
                      <Button
                        onClick={() => entrarNaSala(sala.id_sala)}
                        disabled={loading || saldoAtual < sala.valor_inicial / 2}
                        className="w-full bg-blue-600 hover:bg-blue-700"
                      >
                        {loading ? 'Entrando...' : `Entrar (${sala.valor_inicial / 2} pontos)`}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="criar" className="space-y-4">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center space-x-2">
                <Plus className="h-5 w-5" />
                <span>Criar Nova Sala</span>
              </CardTitle>
              <CardDescription className="text-gray-400">
                Crie uma nova sala de apostas. Você pode ter no máximo 2 salas ativas.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={criarSala} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="nome_sala" className="text-gray-300">
                    Nome da Sala
                  </Label>
                  <Input
                    id="nome_sala"
                    value={novaSala.nome_sala}
                    onChange={(e) => setNovaSala({...novaSala, nome_sala: e.target.value})}
                    placeholder="Digite o nome da sala"
                    required
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="valor_inicial" className="text-gray-300">
                    Valor Inicial (deve ser par)
                  </Label>
                  <Input
                    id="valor_inicial"
                    type="number"
                    value={novaSala.valor_inicial}
                    onChange={(e) => setNovaSala({...novaSala, valor_inicial: e.target.value})}
                    placeholder="Digite o valor inicial"
                    required
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="whatsapp" className="text-gray-300">
                    WhatsApp (opcional)
                  </Label>
                  <Input
                    id="whatsapp"
                    value={novaSala.whatsapp}
                    onChange={(e) => setNovaSala({...novaSala, whatsapp: e.target.value})}
                    placeholder="Digite seu WhatsApp"
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  {loading ? 'Criando...' : 'Criar Sala'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default UserDashboard

