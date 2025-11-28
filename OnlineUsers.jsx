import { useState, useEffect } from 'react'
import { io } from 'socket.io-client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Users, Clock, Wifi } from 'lucide-react'

const OnlineUsers = () => {
  const [usuariosOnline, setUsuariosOnline] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [socket, setSocket] = useState(null)

  const showNotification = (nome) => {
    if (Notification.permission === 'granted') {
      new Notification('Usuário Online', {
        body: `${nome} entrou online!`,
        icon: '/favicon.ico'
      })
    }
  }

  const carregarUsuariosOnline = async () => {
    try {
      const response = await fetch('/api/usuarios-online')
      const data = await response.json()
      
      if (response.ok) {
        setUsuariosOnline(data.usuarios_online)
      } else {
        setError('Erro ao carregar usuários online')
      }
    } catch (err) {
      setError('Erro de conexão')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Solicitar permissão para notificações
    if (Notification.permission === 'default') {
      Notification.requestPermission()
    }

    // Configurar WebSocket
    const newSocket = io()
    setSocket(newSocket)

    newSocket.on('user_online', (data) => {
      showNotification(data.nome)
      carregarUsuariosOnline() // Atualizar lista
    })

    carregarUsuariosOnline()
    
    // Atualizar a cada 30 segundos
    const interval = setInterval(carregarUsuariosOnline, 30000)
    
    return () => {
      clearInterval(interval)
      newSocket.disconnect()
    }
  }, [])

  if (loading) {
    return (
      <Card className="bg-gray-800 border-gray-700">
        <CardContent className="p-6">
          <div className="flex items-center space-x-2">
            <Wifi className="h-4 w-4 text-green-500 animate-pulse" />
            <span className="text-gray-400">Carregando usuários online...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="bg-gray-800 border-gray-700">
        <CardContent className="p-6">
          <div className="flex items-center space-x-2">
            <Wifi className="h-4 w-4 text-red-500" />
            <span className="text-red-400">{error}</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center space-x-2">
          <Users className="h-5 w-5 text-green-500" />
          <span>Usuários Online</span>
          <Badge variant="secondary" className="bg-green-900 text-green-300">
            {usuariosOnline.length}
          </Badge>
        </CardTitle>
        <CardDescription className="text-gray-400">
          Usuários ativos nos últimos 5 minutos
        </CardDescription>
      </CardHeader>
      <CardContent>
        {usuariosOnline.length === 0 ? (
          <div className="text-center py-4">
            <p className="text-gray-400">Nenhum usuário online no momento</p>
          </div>
        ) : (
          <div className="space-y-2">
            {usuariosOnline.map((usuario, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-gray-700 rounded-lg">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-white font-medium">{usuario.nome}</span>
                </div>
                <div className="flex items-center space-x-1 text-xs text-gray-400">
                  <Clock className="h-3 w-3" />
                  <span>{usuario.last_seen}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default OnlineUsers

