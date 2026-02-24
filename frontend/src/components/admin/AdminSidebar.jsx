"use client"
import { Home, Users, Settings, BarChart3, FileText, Bell, LogOut, LucideChevronsRight } from 'lucide-react'
import Link from 'next/link';
import { useState } from 'react'

const AdminNavbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  
  const navItems = [
    { icon: Home, label: "Dashboard", active: true },
    { icon: Users, label: "Users" },
    { icon: BarChart3, label: "Analytics" },
    { icon: FileText, label: "Reports" },
    { icon: Bell, label: "Notifications" },
    { icon: Settings, label: "Settings" }
  ];

  return (
    <nav className={`${isOpen ? 'w-60' : 'w-20'}  bg-black text-white transition-all duration-500 ease-in-out shadow-2xl flex flex-col border-r border-gray-800 overflow-hidden h-screen`}>
      
      {/* Header with Toggle Button */}
      <div className=" relative px-2 h-12 flex items-center justify-between border-b border-gray-800">
        <div className="flex items-center gap-1">
          <div className="w-6 h-6 sm:w-6 sm:h-6 bg-white flex items-center justify-center flex-shrink-0 transition-all duration-300">
            <span className="text-black font-bold text-lg ">A</span>
          </div>
          <span className={`font-semibold text-nowrap text-white transition-all duration-500 text-sm sm:text-base ${
            isOpen ? 'opacity-100 translate-x-0 ml-2' : 'opacity-0 w-0 overflow-hidden ml-0'
          }`}>
            Admin Panel
          </span>
        </div>
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="  transition-all duration-300 ease-in-out "
        >
          <LucideChevronsRight 
            size={14} 
            className={`sm:w-[20px] sm:h-[20px] transition-transform duration-500 ease-in-out text-white  ${isOpen ? 'rotate-180' : 'rotate-0'}`}
          />
        </button>
      </div>

      {/* Navigation Items */}
      <ul className="flex-1 p-1">
        {navItems.map((item, index) => {
          const IconComponent = item.icon;
          return (
            <li key={index} className="mb-1 ">
              <Link href='#' className={`w-full h-9 sm:h-10 text-black flex items-center transition-all duration-300 ease-in-out group rounded-lg p-2  relative ${
                item.active 
                  ? 'bg-white text-black shadow-lg' 
                  : 'hover:bg-gray-800 text-gray-300  hover:text-white'
              } ${isOpen ? 'justify-start gap-1' : 'justify-center'}`}>
                
                <IconComponent size={14} className="sm:w-4 sm:h-4 flex-shrink-0 transition-colors duration-300" />
                
                <span className={`font-medium text-xs sm:text-sm transition-all duration-500 whitespace-nowrap ${
                  isOpen ? 'opacity-100 translate-x-0 ml-2 sm:ml-3' : 'opacity-0 w-0 overflow-hidden ml-0'
                }`}>
                  {item.label}
                </span>
                
                {/* Tooltip for collapsed state */}
                {!isOpen && (
                  <div className="absolute left-full ml-2 bg-white text-black px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none whitespace-nowrap z-10 shadow-lg transform translate-y-0 group-hover:translate-y-0">
                    {item.label}
                  </div>
                )}
              </Link>
            </li>
          );
        })}
      </ul>

      {/* Logout Button */}
      <div className="border-t border-gray-800">
        <div className="px-1 sm:px-0">
          <Link href='#' className={`w-full h-9 sm:h-10 flex items-center transition-all duration-300 ease-in-out group rounded-lg p-2 sm:p-3 hover:bg-gray-800 text-gray-300 hover:text-white relative ${isOpen ? 'justify-start gap-1' : 'justify-center'}`}>
            <LogOut size={14} className="sm:w-4 sm:h-4 flex-shrink-0 transition-colors duration-300" />
            
            <span className={`font-medium text-xs sm:text-sm transition-all duration-500 whitespace-nowrap ${
              isOpen ? 'opacity-100 translate-x-0 ml-2 sm:ml-3' : 'opacity-0 w-0 overflow-hidden ml-0'
            }`}>
              Logout
            </span>
            
            {/* Tooltip for collapsed state */}
            {!isOpen && (
              <div className="absolute left-full ml-2 bg-white text-black px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none whitespace-nowrap z-10 shadow-lg">
                Logout
              </div>
            )}
          </Link>
        </div>
      </div>
    </nav>
  )
}

export default AdminNavbar