import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { LogOut, User, Shield } from 'lucide-react'
import UserDashboard from './UserDashboard'
import AdminDashboard from './AdminDashboard'

const Dashboard = ({ user, onLogout }) => {
  const isAdmin = user.tipo === 'admin'

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {isAdmin ? (
              <Shield className="h-6 w-6 text-yellow-500" />
            ) : (
              <User className="h-6 w-6 text-blue-500" />
            )}
            <div>
              <h1 className="text-3xl font-bold text-white">Stake's Arena</h1>
              <p className="text-sm text-gray-400">
                {isAdmin ? 'Painel Administrativo' : 'Painel do Usuário'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm font-medium text-white">{user.nome}</p>
              <p className="text-xs text-gray-400">
                {isAdmin ? 'Administrador' : `${user.pontos} pontos`}
              </p>
            </div>
            <Button
              onClick={onLogout}
              variant="outline"
              size="sm"
              className="border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-4">
        {isAdmin ? (
          <AdminDashboard user={user} />
        ) : (
          <UserDashboard user={user} />
        )}
      </main>
    </div>
  )
}

export default Dashboard

