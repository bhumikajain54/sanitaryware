import { NavLink } from 'react-router-dom';
import { 
  MdDashboard, 
  MdInventory, 
  MdCategory, 
  MdShoppingCart, 
  MdPeople,
  MdImage,
  MdArticle
} from 'react-icons/md';

const AdminNavbar = () => {
  const navItems = [
    { name: 'Dashboard', path: '/admin', icon: MdDashboard },
    { name: 'Products', path: '/admin/products', icon: MdInventory },
    { name: 'Categories', path: '/admin/categories', icon: MdCategory },
    { name: 'Orders', path: '/admin/orders', icon: MdShoppingCart },
    { name: 'Customers', path: '/admin/customers', icon: MdPeople },
    { name: 'Media', path: '/admin/media', icon: MdImage },
    { name: 'Content', path: '/admin/content', icon: MdArticle },
  ];

  return (
    <nav className="bg-white shadow-sm">
      <div className="px-4 sm:px-6">
        <div className="flex gap-1 overflow-x-auto scrollbar-hide">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/admin'}
              className={({ isActive }) =>
                `flex items-center gap-2 px-3 sm:px-4 py-3 text-xs sm:text-sm font-medium whitespace-nowrap transition-all border-b-2 ${
                  isActive
                    ? 'text-primary border-primary bg-teal-50'
                    : 'text-gray-600 border-transparent hover:text-primary hover:border-teal-300 hover:bg-teal-50'
                }`
              }
            >
              <item.icon className="text-base sm:text-lg flex-shrink-0" />
              <span className="hidden sm:inline">{item.name}</span>
            </NavLink>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default AdminNavbar;
