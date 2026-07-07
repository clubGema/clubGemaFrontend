import React, { useState, useEffect } from 'react';
import { Ticket, UserPlus, CheckCircle, Loader2, AlertTriangle, ShieldCheck, Send, User, Phone, Clock, CreditCard, DollarSign, MapPin, Layers, Search, Calendar, ShoppingBag, X, Plus } from 'lucide-react';
import { apiFetch } from '../../interceptors/api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { sedeService } from '../../services/sede.service';
import { API_ROUTES } from '../../constants/apiRoutes';

const diasSemana = [
  { id: 1, nombre: "lunes" },
  { id: 2, nombre: "martes" },
  { id: 3, nombre: "miercoles" },
  { id: 4, nombre: "jueves" },
  { id: 5, nombre: "viernes" },
  { id: 6, nombre: "sabado" },
  { id: 7, nombre: "domingo" },
]

const getDayName = (dayNumber) => {
  const days = ['', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
  return days[dayNumber] || 'Día inválido';
}

const AdminGuestPasses = () => {
  const { userId } = useAuth();
  const [loadingConfig, setLoadingConfig] = useState(true);
  const [creating, setCreating] = useState(false);
  const [guestUser, setGuestUser] = useState(null);

  // Estados para el Formulario de Venta
  const [alumnos, setAlumnos] = useState([]);
  const [alumnoSelect, setAlumnoSelect] = useState(null);
  const [textoBusqueda, setTextoBusqueda] = useState('');
  const [horarios, setHorarios] = useState([]);
  const [sedes, setSedes] = useState([]);
  const [sedeSelect, setSedeSelect] = useState('');
  const [niveles, setNiveles] = useState([]);
  const [nivelSelect, setNivelSelect] = useState('');
  const [diaSelect, setDiaSelect] = useState('');
  const [metodosPago, setMetodosPago] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const [formData, setFormData] = useState({
    alumno_id: '',
    idHorario: '',
    fecha_inicio_electiva: '',
    metodo_pago: '',
    codigo_operacion: '',
    usuario_admin_id: ''
  });
  const [formDataList, setFormDataList] = useState([]);

  const fetchData = async () => {
    try {
      setLoadingConfig(true);

      try {
        const resAlumnos = await apiFetch.get(API_ROUTES.USUARIOS.ALUMNOS);
        const alumnosResult = await resAlumnos.json();
        setAlumnos(alumnosResult.data);
      } catch (e) {
        console.error("Error cargando alumnos", e)
      }

      try {
        const resHorarios = await apiFetch.get('/horarios');
        const horariosResult = await resHorarios.json();
        if (resHorarios.ok && horariosResult.data) {
          const rawHorarios = horariosResult.data.filter(h => h.activo);
          const transformedHorarios = rawHorarios.map(rh => {
            return {
              id: rh.id,
              dia: {
                id: rh.dia_semana,
                nombre: getDayName(rh.dia_semana),
              },
              hora: `${rh.hora_inicio} - ${rh.hora_fin}`,
              nivel: rh.nivel,
              sede: rh.cancha?.sede,

            }
          })
          setHorarios(transformedHorarios);
        }
      } catch (e) {
        console.error("Error cargando horarios", e);
      }

      try {
        const sedesResult = await sedeService.getAll();
        const sedesActivas = sedesResult.data.filter(sr => sr.activo)
        setSedes(sedesActivas);
      } catch (e) {
        console.error("Error cargando sedes", e)
      }

      try {
        const resNiveles = await apiFetch.get('/niveles');
        const nivelesResult = await resNiveles.json();
        setNiveles(nivelesResult.data);
      } catch (e) {
        console.error("Error cargando niveles", e)
      }

      try {
        const resMetodos = await apiFetch.get('/metodos-pago');
        const metodosResult = await resMetodos.json();

        if (resMetodos.ok && metodosResult.data) {
          setMetodosPago(metodosResult.data.filter(m => m.activo));
        } else {
          throw new Error("No hay métodos");
        }
      } catch (e) {
        console.error("Error cargando métodos de pago", e);
      }

    } catch (error) {
      console.error(error);
      toast.error("Error crítico sincronizando el sistema");
    } finally {
      setLoadingConfig(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const addInscInd = () => {
    if (!alumnoSelect) {
      toast.error('Falta seleccionar el alumno.');
      return;
    }
    if (!userId) {
      toast.error('Falta ID del admin. Por favor, vuelva a iniciar sesión.');
      return;
    }
    if (!formData.idHorario) {
      toast.error('Falta seleccionar el horario.');
      return;
    }
    if (!formData.fecha_inicio_electiva) {
      toast.error('Falta seleccionar la fecha de la clase.');
      return;
    }
    if (!formData.metodo_pago) {
      toast.error('Falta seleccionar el método de pago.');
      return;
    }
    const formActualizado = {
      ...formData,
      alumno_id: alumnoSelect.id,
      usuario_admin_id: userId,
    }

    setFormDataList(prev => [...prev, formActualizado])
    setAlumnoSelect(null);
    setTextoBusqueda('');
    setSedeSelect('')
    setNivelSelect('')
    setDiaSelect('')
    setFormData({
      alumno_id: '',
      idHorario: '',
      fecha_inicio_electiva: '',
      metodo_pago: '',
      codigo_operacion: '',
      usuario_admin_id: ''
    })
  }

  // 3. PROCESAR LA VENTA EXPRESS
  const handleInscripcionIndividual = async (e) => {
    e.preventDefault();

    if (formDataList.length === 0) {
      toast.error('No hay ninguna clase agregada.');
      return;
    }
    setSubmitting(true);
    setFormDataList([]);
    try {
      const result = await apiFetch.post('/inscripciones/individual-admin', formDataList);
      const data = await result.json();
      if (!result.ok) {
        throw new Error(data.message || 'Error en el proceso de inscripción individual')
      }
      toast.success('Inscripción(es) realizada(s) correctamente')
    } catch (error) {
      toast.error(error.message || "Error Interno del Servidor");
    } finally {
      setSubmitting(false);
    }
  };

  const alumnosFiltrados = alumnos.filter((usuario) => {
    const nombreCompleto = `${usuario.nombres} ${usuario.apellidos}`.toLowerCase();
    return nombreCompleto.includes(textoBusqueda.toLowerCase());
  });

  const horariosFiltrados = horarios.filter(h =>
    (!diaSelect || h.dia.id === Number(diaSelect)) &&
    (!nivelSelect || h.nivel.id === Number(nivelSelect)) &&
    (!sedeSelect || h.sede.id === Number(sedeSelect))
  );

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 animate-fade-in pb-24">

      {/* HEADER */}
      <div className="mb-10 flex items-center gap-4">
        <div className="w-16 h-16 bg-gradient-to-br from-[#1e3a8a] to-[#0f172a] rounded-2xl flex items-center justify-center text-white shadow-xl transform -rotate-3">
          <Ticket size={32} />
        </div>
        <div>
          <h1 className="text-4xl font-black text-[#1e3a8a] uppercase tracking-tighter italic leading-none">
            Inscripción <span className="text-orange-500">Individual</span>
          </h1>
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-1">
            Registro de Clases Únicas al Alumno
          </p>
        </div>
      </div>

      <form onSubmit={handleInscripcionIndividual} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

          <div className="lg:col-span-2">
            <div className={`bg-white p-8 rounded-[2.5rem] shadow-2xl border-4 border-white transition-opacity`}>

              <div className="flex items-center justify-between mb-8">
                <h2 className="font-black text-[#1e3a8a] uppercase italic text-2xl">Formulario de Registro</h2>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-1">
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      <User size={12} /> Nombre del Alumno
                    </label>
                    {alumnoSelect && (
                      <span className="text-[10px] font-black text-green-500 uppercase tracking-widest flex items-center gap-1">
                        ✓ Alumno seleccionado
                      </span>
                    )}
                  </div>

                  <div className="relative" onBlur={() => setIsOpen(false)}>
                    <input
                      type="text"
                      placeholder="Ej. Victor Margarito"
                      className={`w-full rounded-2xl px-5 py-4 text-sm font-bold text-[#1e3a8a] outline-none transition-all uppercase border ${alumnoSelect
                        ? "bg-green-50/30 border-green-500 focus:ring-4 focus:ring-green-500/20"
                        : "bg-slate-50 border-slate-200 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500"
                        }`}
                      value={textoBusqueda}
                      onFocus={() => setIsOpen(true)}
                      onChange={(e) => {
                        setTextoBusqueda(e.target.value);
                        setAlumnoSelect(null);
                        setIsOpen(true);
                      }}
                    />
                    <Search size={16} className={`absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none transition-colors ${alumnoSelect ? 'text-green-500' : 'text-slate-400'}`} />

                    {isOpen && (
                      <div className="absolute z-50 w-full mt-2 bg-white border border-slate-100 rounded-2xl shadow-xl max-h-60 overflow-y-auto overflow-x-hidden p-2 transition-all">
                        {alumnosFiltrados.length > 0 ? (
                          alumnosFiltrados.map((usuario) => (
                            <button
                              key={usuario.id}
                              type="button"
                              className="w-full text-left px-4 py-3 text-sm font-bold text-[#1e3a8a] hover:bg-slate-50 rounded-xl transition-colors uppercase flex items-center gap-2"
                              onMouseDown={(e) => e.preventDefault()}
                              onClick={() => {
                                setAlumnoSelect(usuario);
                                setTextoBusqueda(`${usuario.nombres} ${usuario.apellidos}`);
                                setIsOpen(false);
                              }}
                            >
                              <div className="w-2 h-2 rounded-full bg-green-400" />
                              {`${usuario.nombres} ${usuario.apellidos}`}
                            </button>
                          ))
                        ) : (
                          <div className="px-4 py-3 text-xs font-semibold text-slate-400 italic">
                            NO EXISTEN ALUMNOS CON EL NOMBRE INGRESADO.
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                      <MapPin size={12} /> Sede
                    </label>
                    <select
                      id="sedeSelect"
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm font-bold text-[#1e3a8a] focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all uppercase cursor-pointer"
                      value={sedeSelect}
                      onChange={(e) => {
                        setSedeSelect(e.target.value);
                        setFormData({ ...formData, idHorario: '' })
                      }}
                    >
                      <option value="">SELECCIONAR SEDE</option>
                      {
                        sedes.map((s) => {
                          return (
                            <option key={s.id} value={s.id}>
                              {s.nombre}
                            </option>
                          );
                        })
                      }
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                      <Layers size={12} /> Nivel
                    </label>
                    <select
                      id="nivelSelect"
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm font-bold text-[#1e3a8a] focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all uppercase cursor-pointer"
                      value={nivelSelect}
                      onChange={(e) => {
                        setNivelSelect(e.target.value);
                        setFormData({ ...formData, idHorario: '' })
                      }}
                    >
                      <option value="">SELECCIONAR NIVEL</option>
                      {
                        niveles.map((n) => {
                          return (
                            <option key={n.id} value={n.id}>
                              {n.nombre}
                            </option>
                          );
                        })
                      }
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                      <Clock size={12} /> Día
                    </label>
                    <select
                      id="diaSelect"
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm font-bold text-[#1e3a8a] focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all uppercase cursor-pointer"
                      value={diaSelect}
                      onChange={(e) => {
                        setDiaSelect(e.target.value);
                        setFormData({ ...formData, idHorario: '' })
                      }}
                    >
                      <option value="">SELECCIONAR DÍA</option>
                      {
                        diasSemana.map((d) => {
                          return (
                            <option key={d.id} value={d.id}>
                              {d.nombre}
                            </option>
                          );
                        })
                      }
                    </select>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      <Clock size={12} /> Horarios
                    </label>

                    {formData.idHorario && formData.idHorario !== "" && (
                      <span className="text-[10px] font-black text-green-500 uppercase tracking-widest animate-pulse flex items-center gap-1">
                        ✓ Horario seleccionado
                      </span>
                    )}
                  </div>

                  <select
                    id="horarioSelect"
                    className={`w-full rounded-2xl px-5 py-4 text-sm font-bold text-[#1e3a8a] outline-none transition-all uppercase cursor-pointer border ${formData.idHorario && formData.idHorario !== ""
                      ? "bg-green-50/30 border-green-500 focus:ring-4 focus:ring-green-500/20"
                      : "bg-slate-50 border-slate-200 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500"
                      }`}
                    value={formData.idHorario}
                    onChange={(e) => setFormData({ ...formData, idHorario: e.target.value })}
                  >
                    <option value="">SELECCIONAR HORARIO</option>
                    {horariosFiltrados.map((hf) => {
                      return (
                        <option key={hf.id} value={hf.id}>
                          [{hf.dia?.nombre}] {hf.hora} | {hf.nivel?.nombre} | {hf.sede?.nombre}
                        </option>
                      );
                    })}
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                      <Calendar size={12} /> Fecha de Clase Única
                    </label>
                    <input
                      type="date"
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm font-black text-[#1e3a8a] focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all text-left dynamic-date-input"
                      value={formData.fecha_inicio_electiva || ''}
                      onChange={(e) => setFormData({ ...formData, fecha_inicio_electiva: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                      <CreditCard size={12} /> Método de Pago
                    </label>
                    <select
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm font-bold text-[#1e3a8a] focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all uppercase cursor-pointer"
                      value={formData.metodo_pago}
                      onChange={(e) => setFormData({ ...formData, metodo_pago: e.target.value })}
                    >
                      <option value="">SELECCIONAR MÉTODO</option>
                      {metodosPago.map(m => (
                        <option key={m.id} value={m.id}>{m.nombre}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                      <DollarSign size={12} /> Código de Pago
                    </label>
                    <input
                      type="text"
                      placeholder="Ej. 563"
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm font-black text-[#1e3a8a] focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all placeholder:text-slate-300 placeholder:font-bold"
                      value={formData.codigo_operacion}
                      onChange={(e) => setFormData({ ...formData, codigo_operacion: e.target.value })}
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={addInscInd}
                  className="w-full bg-[#1e3a8a] hover:bg-[#0f172a] text-white py-5 rounded-2xl font-black uppercase italic tracking-widest text-sm flex items-center justify-center gap-3 transition-all shadow-xl hover:shadow-blue-900/30 group mt-4"
                >
                  {<Plus size={20} className="group-hover:translate-x-1 transition-transform" />}
                  Agregar Clase Única
                </button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1 sticky top-6">
            <div className="bg-slate-900 text-white p-6 rounded-[2.5rem] shadow-2xl border-4 border-slate-800 flex flex-col max-h-[80vh]">

              <div className="flex items-center justify-between mb-6 border-b border-slate-800 pb-4">
                <div>
                  <h3 className="font-black uppercase italic text-lg text-orange-400">Resumen de Clases</h3>
                </div>
                <div className="bg-slate-800 px-3 py-2 rounded-xl text-xs font-black text-white border border-slate-700">
                  {formDataList.length}
                </div>
              </div>

              <div className="flex-1 overflow-y-auto space-y-3 pr-1 scrollbar-thin">
                {formDataList.length > 0 ? (
                  formDataList.map((item, index) => {
                    const alumno = alumnos.find(a => a.id === Number(item.alumno_id));
                    const horario = horarios.find(h => h.id === Number(item.idHorario));
                    const pago = metodosPago.find(m => m.id === Number(item.metodo_pago));

                    return (
                      <div key={index} className="bg-slate-800/60 border border-slate-800 p-4 rounded-2xl relative group hover:border-slate-700 transition-all animate-fade-in">

                        <button
                          type="button"
                          onClick={() => setFormDataList(formDataList.filter((_, i) => i !== index))}
                          className="absolute top-3 right-3 text-slate-500 hover:text-red-400 transition-colors"
                        >
                          <X size={16} />
                        </button>

                        <p className="text-xs font-black text-orange-400 uppercase tracking-wide mb-1 truncate max-w-[85%]">
                          {alumno ? `${alumno.nombres} ${alumno.apellidos}` : "Alumno Indefinido"}
                        </p>

                        <div className="space-y-1 text-[11px] text-slate-300 font-medium uppercase">
                          <p className="flex items-center gap-1.5 truncate">
                            <Clock size={10} className="text-slate-500" />
                            {horario ? `${horario.dia?.nombre} ${horario.hora}` : "Horario no encontrado"}
                          </p>
                          <p className="flex items-center gap-1.5 truncate">
                            <Layers size={10} className="text-slate-500" />
                            {horario ? `${horario.nivel?.nombre}` : "Nivel no encontrada"}
                          </p>
                          <p className="flex items-center gap-1.5 truncate">
                            <MapPin size={10} className="text-slate-500" />
                            {horario ? `${horario.sede?.nombre}` : "Sede no encontrada"}
                          </p>
                          <p className="flex items-center gap-1.5 text-slate-400 text-[10px]">
                            <Calendar size={10} className="text-slate-500" />
                            Fecha: {item.fecha_inicio_electiva.split("-").reverse().join("-")}
                          </p>
                          <div className="pt-2 mt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-bold text-slate-400">
                            <span>{pago ? pago.nombre : 'Pago'}</span>
                            <span className="text-slate-500">#{item.codigo_operacion || 'S/C'}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center p-6 py-12 border-2 border-dashed border-slate-800 rounded-2xl bg-slate-950/30">
                    <ShoppingBag size={32} className="text-slate-700 mb-2" />
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Las clases agregadas se mostrarán en esta sección</p>
                  </div>
                )}
              </div>

              {/* BOTÓN 2: Enviar todo el Formulario al Backend */}
              <div className="mt-6 pt-4 border-t border-slate-800">
                <button
                  type="submit"
                  disabled={submitting || formDataList.length === 0}
                  className="w-full bg-green-500 hover:bg-green-600 disabled:bg-slate-800 disabled:text-slate-600 text-white py-5 rounded-2xl font-black uppercase italic tracking-widest text-sm flex items-center justify-center gap-3 transition-all shadow-xl disabled:shadow-none hover:shadow-green-900/30 group"
                >
                  {submitting ? (
                    <Loader2 className="animate-spin" size={20} />
                  ) : (
                    <Send size={20} className="group-hover:scale-110 transition-transform" />
                  )}
                  Enviar
                </button>
              </div>

            </div>
          </div>

        </div>
      </form>
    </div>
  );
};

export default AdminGuestPasses;