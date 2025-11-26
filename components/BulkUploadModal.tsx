
import React, { useState, useRef } from 'react';
import { Vehicle, VehicleStatus } from '../types';
import { X, Upload, FileText, AlertCircle, CheckCircle, HelpCircle, Download } from 'lucide-react';

interface BulkUploadModalProps {
  onImport: (vehicles: Vehicle[]) => void;
  onClose: () => void;
}

const BulkUploadModal: React.FC<BulkUploadModalProps> = ({ onImport, onClose }) => {
  const [dragActive, setDragActive] = useState(false);
  const [parsedVehicles, setParsedVehicles] = useState<Vehicle[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [fileName, setFileName] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Helper to map loose CSV/JSON headers to our strict Schema
  const mapKey = (key: string): keyof Vehicle | null => {
    const k = key.toLowerCase().trim().replace(/_/g, '').replace(/-/g, '');
    if (['id', 'identificador', 'internalid'].includes(k)) return 'id';
    if (['make', 'marca', 'brand', 'fabricante'].includes(k)) return 'make';
    if (['model', 'modelo', 'version'].includes(k)) return 'model';
    if (['year', 'año', 'anio', 'yearmodel'].includes(k)) return 'year';
    if (['price', 'precio', 'valor', 'costo'].includes(k)) return 'price';
    if (['status', 'estado', 'disponibilidad'].includes(k)) return 'status';
    if (['image', 'imagen', 'imageurl', 'foto', 'url', 'images'].includes(k)) return 'imageUrl';
    if (['mileage', 'km', 'kilometraje', 'odometro'].includes(k)) return 'mileage';
    if (['transmission', 'transmision', 'caja', 'cambios'].includes(k)) return 'transmission';
    if (['fuel', 'combustible', 'fueltype', 'tipocombustible'].includes(k)) return 'fuelType';
    if (['description', 'descripcion', 'notas', 'detalle', 'desc'].includes(k)) return 'description';
    return null;
  };

  const parseValue = (key: keyof Vehicle, value: any): any => {
    if (key === 'price' || key === 'mileage' || key === 'year') {
      return Number(String(value).replace(/[^0-9.]/g, '')) || 0;
    }
    if (key === 'status') {
       const v = String(value).toLowerCase();
       if (v.includes('vendido') || v.includes('sold')) return VehicleStatus.SOLD;
       if (v.includes('reservado') || v.includes('reserved')) return VehicleStatus.RESERVED;
       return VehicleStatus.AVAILABLE;
    }
    // Handle array of images from the script example by taking the first one
    if (key === 'imageUrl' && Array.isArray(value)) {
        return value.length > 0 ? value[0] : 'https://picsum.photos/800/600';
    }
    return value;
  };

  const processData = (data: any[]) => {
    const newVehicles: Vehicle[] = [];
    const newErrors: string[] = [];

    data.forEach((row, index) => {
      // Default structure
      const vehicle: any = {
        id: `bulk_${Date.now()}_${index}`,
        status: VehicleStatus.AVAILABLE,
        imageUrl: 'https://picsum.photos/800/600', // Default placeholder
        mileage: 0,
        transmission: 'Automática',
        fuelType: 'Gasolina', 
        description: 'Vehículo importado masivamente.',
        price: 0,
        year: new Date().getFullYear(),
        make: '',
        model: ''
      };

      let hasData = false;
      Object.keys(row).forEach(rawKey => {
        const mappedKey = mapKey(rawKey);
        if (mappedKey) {
          vehicle[mappedKey] = parseValue(mappedKey, row[rawKey]);
          hasData = true;
        }
      });

      if (!hasData) return; // Skip empty rows

      // Basic Validation
      if (!vehicle.make || !vehicle.model) {
        newErrors.push(`Fila ${index + 1}: Falta Marca o Modelo.`);
      } else if (vehicle.price <= 0) {
        newErrors.push(`Fila ${index + 1} (${vehicle.make} ${vehicle.model}): Precio inválido.`);
      } else {
        newVehicles.push(vehicle as Vehicle);
      }
    });

    setParsedVehicles(newVehicles);
    setErrors(newErrors);
  };

  const handleFile = (file: File) => {
    setFileName(file.name);
    const reader = new FileReader();

    reader.onload = (e) => {
      const content = e.target?.result as string;
      
      if (file.name.toLowerCase().endsWith('.json')) {
        try {
          const json = JSON.parse(content);
          if (Array.isArray(json)) {
            processData(json);
          } else {
            setErrors(['El archivo JSON debe contener un array de objetos.']);
          }
        } catch (err) {
          setErrors(['Error al leer JSON. Formato inválido.']);
        }
      } else {
        // Assume CSV
        const lines = content.split(/\r\n|\n/);
        if (lines.length < 2) {
          setErrors(['El archivo CSV parece estar vacío o sin cabeceras.']);
          return;
        }
        
        // Detect delimiter (comma or semicolon)
        const firstLine = lines[0];
        const delimiter = firstLine.includes(';') ? ';' : ',';
        
        const headers = firstLine.split(delimiter).map(h => h.trim().replace(/"/g, ''));
        const data = [];
        
        for (let i = 1; i < lines.length; i++) {
          if (!lines[i].trim()) continue;
          const values = lines[i].split(delimiter); 
          const obj: any = {};
          headers.forEach((h, index) => {
             // Basic clean up of quotes
             obj[h] = values[index]?.trim().replace(/^"|"$/g, '') || '';
          });
          data.push(obj);
        }
        processData(data);
      }
    };

    reader.readAsText(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const downloadTemplate = () => {
      const headers = "Marca,Modelo,Año,Precio,Km,Combustible,Transmision,Estado,ImagenUrl,Descripcion";
      const example = "Toyota,Corolla,2023,25000,15000,Gasolina,Automatica,Disponible,https://ejemplo.com/foto.jpg,Vehiculo en perfecto estado";
      const csvContent = "data:text/csv;charset=utf-8," + headers + "\n" + example;
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", "plantilla_vehiculos.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  }

  return (
    <div 
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fadeIn"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl p-6 relative animate-scaleIn"
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full p-1 transition-colors"
        >
          <X size={20} />
        </button>

        <div className="flex justify-between items-center mb-2">
            <h2 className="text-xl font-bold text-gray-900">Importación Masiva</h2>
            <button onClick={downloadTemplate} className="text-indigo-600 text-xs font-medium flex items-center gap-1 hover:underline">
                <Download size={14}/> Descargar Plantilla CSV
            </button>
        </div>
        <p className="text-sm text-gray-500 mb-6">Carga un archivo CSV o JSON para añadir múltiples vehículos a la vez.</p>

        {!parsedVehicles.length && !errors.length ? (
            <div 
                className={`border-2 border-dashed rounded-xl p-10 text-center transition-all ${
                    dragActive ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300 hover:border-indigo-400 hover:bg-gray-50'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
            >
                <div className="flex flex-col items-center justify-center gap-4">
                    <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600">
                        <Upload size={32} />
                    </div>
                    <div>
                        <p className="font-medium text-gray-900">Arrastra tu archivo aquí</p>
                        <p className="text-sm text-gray-500 mt-1">Soporta .csv y .json</p>
                    </div>
                    <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 shadow-sm"
                    >
                        Seleccionar Archivo
                    </button>
                    <input 
                        ref={fileInputRef}
                        type="file" 
                        accept=".csv,.json"
                        className="hidden"
                        onChange={handleChange}
                    />
                </div>
                
                <div className="mt-8 text-xs text-gray-400 bg-gray-50 p-3 rounded text-left">
                    <p className="font-bold mb-1 flex items-center gap-1"><HelpCircle size={12}/> Formato aceptado:</p>
                    <p>El sistema detectará automáticamente columnas como: <i>Marca, Brand, Modelo, Precio, Price, Km, Año...</i></p>
                </div>
            </div>
        ) : (
            <div className="space-y-6">
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <FileText className="text-gray-500" />
                    <div className="flex-1">
                        <p className="font-medium text-gray-900">{fileName}</p>
                        <div className="flex gap-4 text-xs mt-1">
                            <span className="text-green-600 flex items-center gap-1"><CheckCircle size={12}/> {parsedVehicles.length} vehículos listos</span>
                            {errors.length > 0 && (
                                <span className="text-red-600 flex items-center gap-1"><AlertCircle size={12}/> {errors.length} errores (no se importarán)</span>
                            )}
                        </div>
                    </div>
                    <button onClick={() => { setParsedVehicles([]); setErrors([]); setFileName(''); }} className="text-xs text-gray-500 hover:text-red-500 underline">
                        Cambiar archivo
                    </button>
                </div>

                {errors.length > 0 && (
                    <div className="bg-red-50 p-4 rounded-lg max-h-32 overflow-y-auto border border-red-100">
                        <h4 className="text-xs font-bold text-red-800 uppercase mb-2">Errores detectados</h4>
                        <ul className="list-disc pl-4 space-y-1">
                            {errors.map((err, i) => (
                                <li key={i} className="text-xs text-red-600">{err}</li>
                            ))}
                        </ul>
                    </div>
                )}
                
                {parsedVehicles.length > 0 && (
                     <div className="max-h-40 overflow-y-auto border border-gray-200 rounded-lg">
                        <table className="w-full text-xs text-left">
                            <thead className="bg-gray-50 text-gray-500 font-semibold sticky top-0">
                                <tr>
                                    <th className="p-2">Marca</th>
                                    <th className="p-2">Modelo</th>
                                    <th className="p-2">Año</th>
                                    <th className="p-2">Precio</th>
                                </tr>
                            </thead>
                            <tbody>
                                {parsedVehicles.slice(0, 10).map((v, i) => (
                                    <tr key={i} className="border-t border-gray-100">
                                        <td className="p-2">{v.make}</td>
                                        <td className="p-2">{v.model}</td>
                                        <td className="p-2">{v.year}</td>
                                        <td className="p-2">${v.price.toLocaleString()}</td>
                                    </tr>
                                ))}
                                {parsedVehicles.length > 10 && (
                                    <tr>
                                        <td colSpan={4} className="p-2 text-center text-gray-400 italic">...y {parsedVehicles.length - 10} más</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                     </div>
                )}

                <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                    <button 
                        onClick={onClose}
                        className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-sm font-medium"
                    >
                        Cancelar
                    </button>
                    <button 
                        onClick={() => onImport(parsedVehicles)}
                        disabled={parsedVehicles.length === 0}
                        className="px-6 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-200"
                    >
                        Confirmar Importación
                    </button>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default BulkUploadModal;
