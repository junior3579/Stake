import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { 
  Users, 
  Home, 
  Trophy, 
  UserPlus, 
  Edit, 
  Trash2, 
  Key,
  Coins,
  MessageCircle
} from 'lucide-react'
import OnlineUsers from './OnlineUsers'

const AdminDashboard = ({ user }) => {
  const [usuarios, setUsuarios] = useState([])
  const [salas, setSalas] = useState([])
  const [apostas, setApostas] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Estados para formulários
  const [novoUsuario, setNovoUsuario] = useState({
    nome: '',
    senha: '',
    pontos: '',
    whatsapp: ''
  })

  const [editarUsuario, setEditarUsuario] = useState({
    id: '',
    campo: '',
    valor: ''
  })

  const [confirmarAposta, setConfirmarAposta] = useState({
    id_sala: '',
    id_ganhador: ''
  })

  useEffect(() => {
    carregarDados()
  }, [])

  const carregarDados = async () => {
    try {
      const [usuariosRes, salasRes, apostasRes] = await Promise.all([
        fetch('/api/usuarios'),
        fetch('/api/salas'),
        fetch('/api/apostas')
      ])

      const usuariosData = await usuariosRes.json()
      const salasData = await salasRes.json()
      const apostasData = await apostasRes.json()

      setUsuarios(usuariosData)
      setSalas(salasData)
      setApostas(apostasData)
    } catch (err) {
      setError('Erro ao carregar dados')
    }
  }

  const cadastrarUsuario = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const response = await fetch('/api/usuarios', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(novoUsuario),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess(data.message)
        setNovoUsuario({ nome: '', senha: '', pontos: '', whatsapp: '' })
        carregarDados()
      } else {
        setError(data.error)
      }
    } catch (err) {
      setError('Erro de conexão')
    } finally {
      setLoading(false)
    }
  }

  const alterarSenhaUsuario = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const response = await fetch(`/api/usuarios/${editarUsuario.id}/senha`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ nova_senha: editarUsuario.valor }),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess(data.message)
        setEditarUsuario({ id: '', campo: '', valor: '' })
      } else {
        setError(data.error)
      }
    } catch (err) {
      setError('Erro de conexão')
    } finally {
      setLoading(false)
    }
  }

  const alterarPontosUsuario = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const response = await fetch(`/api/usuarios/${editarUsuario.id}/pontos`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ pontos: editarUsuario.valor }),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess(data.message)
        setEditarUsuario({ id: '', campo: '', valor: '' })
        carregarDados()
      } else {
        setError(data.error)
      }
    } catch (err) {
      setError('Erro de conexão')
    } finally {
      setLoading(false)
    }
  }

  const removerUsuario = async (id) => {
    if (!confirm('Tem certeza que deseja remover este usuário?')) return

    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const response = await fetch(`/api/usuarios/${id}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess(data.message)
        carregarDados()
      } else {
        setError(data.error)
      }
    } catch (err) {
      setError('Erro de conexão')
    } finally {
      setLoading(false)
    }
  }

  const removerSala = async (id) => {
    if (!confirm('Tem certeza que deseja remover esta sala?')) return

    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const response = await fetch(`/api/salas/${id}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess(data.message)
        carregarDados()
      } else {
        setError(data.error)
      }
    } catch (err) {
      setError('Erro de conexão')
    } finally {
      setLoading(false)
    }
  }

  const confirmarApostaHandler = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const response = await fetch('/api/apostas/confirmar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(confirmarAposta),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess(data.message)
        setConfirmarAposta({ id_sala: '', id_ganhador: '' })
        carregarDados()
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
      {/* Usuários Online */}
      <OnlineUsers />

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

      <Tabs defaultValue="usuarios" className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-transparent">
          <TabsTrigger value="usuarios" className="text-gray-300 data-[state=active]:text-white">
            <Users className="h-4 w-4 mr-2" />
            Usuários
          </TabsTrigger>
          <TabsTrigger value="salas" className="text-gray-300 data-[state=active]:text-white">
            <Home className="h-4 w-4 mr-2" />
            Salas
          </TabsTrigger>
          <TabsTrigger value="apostas" className="text-gray-300 data-[state=active]:text-white">
            <Trophy className="h-4 w-4 mr-2" />
            Apostas
          </TabsTrigger>
          <TabsTrigger value="gerenciar" className="text-gray-300 data-[state=active]:text-white">
            <Edit className="h-4 w-4 mr-2" />
            Gerenciar
          </TabsTrigger>
        </TabsList>

        {/* Tab Usuários */}
        <TabsContent value="usuarios" className="space-y-4">
          <div className="grid gap-4">
            {usuarios.length === 0 ? (
              <Card className="bg-gray-800 border-gray-700">
                <CardContent className="p-6 text-center">
                  <p className="text-gray-400">Nenhum usuário encontrado</p>
                </CardContent>
              </Card>
            ) : (
              usuarios.map((usuario) => (
                <Card key={usuario.id} className="bg-gray-800 border-gray-700">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <h3 className="font-medium text-white">{usuario.nome}</h3>
                          <Badge variant="secondary" className="bg-blue-900 text-blue-300">
                            ID: {usuario.id}
                          </Badge>
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-gray-400">
                          <div className="flex items-center space-x-1">
                            <Coins className="h-3 w-3" />
                            <span>{usuario.pontos} pontos</span>
                          </div>
                          {usuario.whatsapp && usuario.whatsapp !== 'Não cadastrado' && (
                            <div className="flex items-center space-x-1">
                              <MessageCircle className="h-3 w-3" />
                              <span>{usuario.whatsapp}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <Button
                        onClick={() => removerUsuario(usuario.id)}
                        variant="destructive"
                        size="sm"
                        disabled={loading}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        {/* Tab Salas */}
        <TabsContent value="salas" className="space-y-4">
          <div className="grid gap-4">
            {salas.length === 0 ? (
              <Card className="bg-gray-800 border-gray-700">
                <CardContent className="p-6 text-center">
                  <p className="text-gray-400">Nenhuma sala encontrada</p>
                </CardContent>
              </Card>
            ) : (
              salas.map((sala) => (
                <Card key={sala.id_sala} className="bg-gray-800 border-gray-700">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-white">{sala.nome_sala}</CardTitle>
                      <div className="flex items-center space-x-2">
                        <Badge variant="secondary" className="bg-blue-900 text-blue-300">
                          {sala.valor_inicial} pontos
                        </Badge>
                        <Button
                          onClick={() => removerSala(sala.id_sala)}
                          variant="destructive"
                          size="sm"
                          disabled={loading}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <CardDescription className="text-gray-400">
                      Criado por: {sala.criador} | ID: {sala.id_sala}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-gray-300">Jogadores:</p>
                      {Object.keys(sala.jogadores).length === 0 ? (
                        <p className="text-sm text-gray-400">Nenhum jogador</p>
                      ) : (
                        Object.entries(sala.jogadores).map(([nome, whatsapp]) => (
                          <div key={nome} className="flex items-center justify-between text-sm">
                            <span className="text-gray-400">{nome}</span>
                            {whatsapp && whatsapp !== 'Não cadastrado' && (
                              <div className="flex items-center space-x-1">
                                <MessageCircle className="h-3 w-3 text-green-500" />
                                <span className="text-green-400">{whatsapp}</span>
                              </div>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        {/* Tab Apostas */}
        <TabsContent value="apostas" className="space-y-4">
          <div className="grid gap-4">
            {apostas.length === 0 ? (
              <Card className="bg-gray-800 border-gray-700">
                <CardContent className="p-6 text-center">
                  <p className="text-gray-400">Nenhuma aposta encontrada</p>
                </CardContent>
              </Card>
            ) : (
              apostas.map((aposta) => (
                <Card key={aposta.id} className="bg-gray-800 border-gray-700">
                  <CardContent className="p-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-gray-400">ID Aposta</p>
                        <p className="text-white font-medium">{aposta.id}</p>
                      </div>
                      <div>
                        <p className="text-gray-400">Sala</p>
                        <p className="text-white font-medium">{aposta.id_sala}</p>
                      </div>
                      <div>
                        <p className="text-gray-400">Usuário</p>
                        <p className="text-white font-medium">{aposta.nome_usuario} (ID: {aposta.id_usuario})</p>
                      </div>
                      <div>
                        <p className="text-gray-400">Valor</p>
                        <p className="text-white font-medium">{aposta.valor_aposta} pontos</p>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center space-x-2">
                      <Badge 
                        variant={aposta.status === 'pendente' ? 'secondary' : 'default'}
                        className={aposta.status === 'pendente' ? 'bg-yellow-900 text-yellow-300' : ''}
                      >
                        {aposta.status}
                      </Badge>
                      <Badge 
                        variant={aposta.resultado === 'pendente' ? 'secondary' : 'default'}
                        className={aposta.resultado === 'pendente' ? 'bg-gray-700 text-gray-300' : ''}
                      >
                        {aposta.resultado}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {/* Confirmar Aposta */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center space-x-2">
                <Trophy className="h-5 w-5" />
                <span>Confirmar Aposta</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={confirmarApostaHandler} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="id_sala_aposta" className="text-gray-300">
                      ID da Sala
                    </Label>
                    <Input
                      id="id_sala_aposta"
                      type="number"
                      value={confirmarAposta.id_sala}
                      onChange={(e) => setConfirmarAposta({...confirmarAposta, id_sala: e.target.value})}
                      placeholder="ID da sala"
                      required
                      className="bg-gray-700 border-gray-600 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="id_ganhador" className="text-gray-300">
                      ID do Ganhador
                    </Label>
                    <Input
                      id="id_ganhador"
                      type="number"
                      value={confirmarAposta.id_ganhador}
                      onChange={(e) => setConfirmarAposta({...confirmarAposta, id_ganhador: e.target.value})}
                      placeholder="ID do usuário ganhador"
                      required
                      className="bg-gray-700 border-gray-600 text-white"
                    />
                  </div>
                </div>
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  {loading ? 'Confirmando...' : 'Confirmar Aposta'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab Gerenciar */}
        <TabsContent value="gerenciar" className="space-y-4">
          {/* Cadastrar Usuário */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center space-x-2">
                <UserPlus className="h-5 w-5" />
                <span>Cadastrar Usuário</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={cadastrarUsuario} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="nome" className="text-gray-300">
                      Nome
                    </Label>
                    <Input
                      id="nome"
                      value={novoUsuario.nome}
                      onChange={(e) => setNovoUsuario({...novoUsuario, nome: e.target.value})}
                      placeholder="Nome do usuário"
                      required
                      className="bg-gray-700 border-gray-600 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="senha" className="text-gray-300">
                      Senha
                    </Label>
                    <Input
                      id="senha"
                      type="password"
                      value={novoUsuario.senha}
                      onChange={(e) => setNovoUsuario({...novoUsuario, senha: e.target.value})}
                      placeholder="Senha"
                      required
                      className="bg-gray-700 border-gray-600 text-white"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="pontos" className="text-gray-300">
                      Pontos (deve ser par)
                    </Label>
                    <Input
                      id="pontos"
                      type="number"
                      value={novoUsuario.pontos}
                      onChange={(e) => setNovoUsuario({...novoUsuario, pontos: e.target.value})}
                      placeholder="Pontos iniciais"
                      required
                      className="bg-gray-700 border-gray-600 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="whatsapp" className="text-gray-300">
                      WhatsApp
                    </Label>
                    <Input
                      id="whatsapp"
                      value={novoUsuario.whatsapp}
                      onChange={(e) => setNovoUsuario({...novoUsuario, whatsapp: e.target.value})}
                      placeholder="WhatsApp (opcional)"
                      className="bg-gray-700 border-gray-600 text-white"
                    />
                  </div>
                </div>
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  {loading ? 'Cadastrando...' : 'Cadastrar Usuário'}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Alterar Senha */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center space-x-2">
                <Key className="h-5 w-5" />
                <span>Alterar Senha de Usuário</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={alterarSenhaUsuario} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="id_usuario_senha" className="text-gray-300">
                      ID do Usuário
                    </Label>
                    <Input
                      id="id_usuario_senha"
                      type="number"
                      value={editarUsuario.id}
                      onChange={(e) => setEditarUsuario({...editarUsuario, id: e.target.value})}
                      placeholder="ID do usuário"
                      required
                      className="bg-gray-700 border-gray-600 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="nova_senha" className="text-gray-300">
                      Nova Senha
                    </Label>
                    <Input
                      id="nova_senha"
                      type="password"
                      value={editarUsuario.valor}
                      onChange={(e) => setEditarUsuario({...editarUsuario, valor: e.target.value})}
                      placeholder="Nova senha"
                      required
                      className="bg-gray-700 border-gray-600 text-white"
                    />
                  </div>
                </div>
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-yellow-600 hover:bg-yellow-700"
                >
                  {loading ? 'Alterando...' : 'Alterar Senha'}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Alterar Pontos */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center space-x-2">
                <Coins className="h-5 w-5" />
                <span>Alterar Pontos de Usuário</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={alterarPontosUsuario} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="id_usuario_pontos" className="text-gray-300">
                      ID do Usuário
                    </Label>
                    <Input
                      id="id_usuario_pontos"
                      type="number"
                      value={editarUsuario.id}
                      onChange={(e) => setEditarUsuario({...editarUsuario, id: e.target.value})}
                      placeholder="ID do usuário"
                      required
                      className="bg-gray-700 border-gray-600 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="novos_pontos" className="text-gray-300">
                      Novos Pontos (deve ser par)
                    </Label>
                    <Input
                      id="novos_pontos"
                      type="number"
                      value={editarUsuario.valor}
                      onChange={(e) => setEditarUsuario({...editarUsuario, valor: e.target.value})}
                      placeholder="Novos pontos"
                      required
                      className="bg-gray-700 border-gray-600 text-white"
                    />
                  </div>
                </div>
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-purple-600 hover:bg-purple-700"
                >
                  {loading ? 'Alterando...' : 'Alterar Pontos'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default AdminDashboard

