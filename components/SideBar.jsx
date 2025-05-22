import { useRouter } from 'next/router';
import Link from 'next/link';
import { Home, Calendar, User, Clock, FileText, Settings, LogOut } from 'lucide-react';

const Sidebar = ({ isOpen }) => {
    const router = useRouter();
    
    const menuItems = [
        {
            name: 'Dashboard',
            icon: <Home className="h-5 w-5" />,
            href: '/dashboard'
        },
        {
            name: 'Appointments',
            icon: <Calendar className="h-5 w-5" />,
            href: '/appointments'
        },
        {
            name: 'Medical Records',
            icon: <FileText className="h-5 w-5" />,
            href: '/records'
        },
        {
            name: 'Profile',
            icon: <User className="h-5 w-5" />,
            href: '/profile'
        },
        {
            name: 'Schedule',
            icon: <Clock className="h-5 w-5" />,
            href: '/schedule'
        },
        {
            name: 'Settings',
            icon: <Settings className="h-5 w-5" />,
            href: '/settings'
        }
    ];

    const isActive = (path) => {
        return router.pathname === path || router.pathname.startsWith(`${path}/`);
    };

    return (
        <div className={`bg-white border-r border-gray-200 min-h-full transition-all duration-300 ease-in-out ${
            isOpen ? 'w-64' : 'w-0 md:w-16 overflow-hidden'
        }`}>
            <div className="flex flex-col h-full py-4">
                <div className="px-4 mb-6">
                    {isOpen ? (
                        <h2 className="text-xl font-bold text-gray-800">MedBlock</h2>
                    ) : (
                        <div className="flex justify-center">
                            <span className="font-bold text-xl text-blue-600">M</span>
                        </div>
                    )}
                </div>
                
                <div className="flex-1 px-2">
                    <nav className="space-y-1">
                        {menuItems.map((item) => (
                            <Link 
                                href={item.href}
                                key={item.name}
                                className={`flex items-center px-2 py-3 text-sm font-medium rounded-md transition-colors ${
                                    isActive(item.href)
                                        ? 'bg-blue-50 text-blue-700'
                                        : 'text-gray-700 hover:bg-gray-100'
                                }`}
                            >
                                <div className={`${isOpen ? 'mr-3' : 'mx-auto'}`}>
                                    {item.icon}
                                </div>
                                {isOpen && <span>{item.name}</span>}
                            </Link>
                        ))}
                    </nav>
                </div>
                
                <div className="px-2 mt-6 mb-2">
                    <button
                        className={`w-full flex items-center px-2 py-3 text-sm font-medium text-red-600 hover:bg-red-50 rounded-md transition-colors ${
                            !isOpen ? 'justify-center' : ''
                        }`}
                        onClick={() => {
                            // Handle logout
                            localStorage.removeItem('token');
                            router.push('/login');
                        }}
                    >
                        <LogOut className="h-5 w-5" />
                        {isOpen && <span className="ml-3">Logout</span>}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Sidebar;