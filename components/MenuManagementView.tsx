
import React, { useState } from 'react';
import { Menu, Vehicle } from '../types';
import { Plus, Eye, Copy, Trash2, ExternalLink, Menu as MenuIcon, Calendar } from 'lucide-react';

interface MenuManagementViewProps {
  menus: Menu[];
  vehicles: Record<string, Vehicle>;
  onCreateClick: () => void;
}

const MenuManagementView: React.FC<MenuManagementViewProps> = ({ menus, vehicles, onCreateClick }) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopyLink = (menuId: string) => {
    // Construct local URL with query param
    const url = `${window.location.origin}${window.location.pathname}?menu=${menuId}`;
    navigator.clipboard.writeText(url);
    setCopiedId(menuId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <MenuIcon className="text-indigo-600" />
            Gestión de Menús
          </h2>
          <p className="text-gray-500 text-sm mt-1">Crea catálogos personalizados para compartir y mide sus vistas.</p>
        </div>
        <button
          onClick={onCreateClick}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-lg shadow-indigo-200 flex items-center gap-2"
        >
          <Plus size={18} />
          Nuevo Menú
        </button>
      </div>

      {menus.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-300">
          <div className="bg-indigo-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-indigo-500">
            <MenuIcon size={32} />
          </div>
          <h3 className="text-lg font-medium text-gray-900">No tienes menús creados</h3>
          <p className="text-gray-500 mt-1 max-w-sm mx-auto">
            Crea un menú seleccionando vehículos de tu inventario para compartir una URL profesional con tus clientes.
          </p>
          <button
            onClick={onCreateClick}
            className="mt-6 text-indigo-600 font-medium hover:underline"
          >
            Crear mi primer menú
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {menus
            .filter(menu => menu.id !== '__FULL_INVENTORY__') // Ocultar catálogo de sistema
            .map(menu => {
              // Calculate stats or get previews
              const previewImages = menu.vehicleIds
                .map(id => vehicles[id]?.imageUrl)
                .filter(Boolean)
                .slice(0, 3);

              return (
                <div key={menu.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all group">
                  <div className="h-32 bg-gray-100 relative p-4 grid grid-cols-3 gap-1">
                    {previewImages.map((img, i) => (
                      <img key={i} src={img} className="w-full h-full object-cover rounded-md" alt="Preview" />
                    ))}
                    {previewImages.length === 0 && (
                      <div className="col-span-3 flex items-center justify-center text-gray-400 text-xs">Sin imágenes</div>
                    )}
                    <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                      <Eye size={12} /> {menu.viewCount} vistas
                    </div>
                  </div>

                  <div className="p-5">
                    <h3 className="font-bold text-gray-900 text-lg mb-1">{menu.name}</h3>
                    <p className="text-xs text-gray-500 flex items-center gap-1 mb-4">
                      <Calendar size={12} />
                      Creado el {new Date(menu.createdAt).toLocaleDateString()}
                      <span className="mx-1">•</span>
                      {menu.vehicleIds.length} vehículos
                    </p>

                    <div className="flex gap-2 mt-4">
                      <button
                        onClick={() => handleCopyLink(menu.id)}
                        className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium border transition-all ${copiedId === menu.id
                            ? 'bg-green-50 border-green-200 text-green-700'
                            : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                          }`}
                      >
                        {copiedId === menu.id ? <ExternalLink size={16} /> : <Copy size={16} />}
                        {copiedId === menu.id ? '¡Copiado!' : 'Copiar Link'}
                      </button>
                      {/* Delete button could go here */}
                    </div>
                  </div>
                </div>
              )
            })}
        </div>
      )}
    </div>
  );
};

export default MenuManagementView;
