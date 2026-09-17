import { useNavigate } from 'react-router-dom'
import { BookOpenCheck, LogOut } from 'lucide-react'
import { useApp } from '../context/AppContext'
import ProfileMenu from './ProfileMenu'

export default function Navbar() {
  const { currentUser, logout } = useApp()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <header className="bg-white border-b border-ink-100 sticky top-0 z-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-lg bg-forest-600 flex items-center justify-center">
            <BookOpenCheck size={18} className="text-white" />
          </div>
          <span className="font-display font-semibold text-lg text-ink-900">Logify</span>
        </div>
        {currentUser && (
          <div className="flex items-center gap-2">
            <ProfileMenu />
            <button
              onClick={handleLogout}
              className="w-9 h-9 rounded-lg hover:bg-ink-100 flex items-center justify-center text-ink-500"
              title="Log out"
            >
              <LogOut size={18} />
            </button>
          </div>
        )}
      </div>
    </header>
  )
}