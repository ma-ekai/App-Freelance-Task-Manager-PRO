import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Plus, Pencil, Trash2, X, Sparkles, LayoutDashboard } from 'lucide-react';
import api from '../api';

const COLUMNS = [
  { id: 'todo',    label: '📋 Por Hacer',   color: 'bg-gray-50' },
  { id: 'doing',   label: '⚡ En Proceso',  color: 'bg-mint-50' },
  { id: 'blocked', label: '🚫 Bloqueado', color: 'bg-red-50' },
  { id: 'review',  label: '👁 Revisión',  color: 'bg-orange-50' },
  { id: 'done',    label: '✅ Completado',  color: 'bg-green-50' },
];

const AI_COLUMNS = [
  { id: 'foco_profundo', label: '🧠 Foco Profundo',   color: 'bg-purple-50' },
  { id: 'rapidas',       label: '⚡ Rápidas (Pim-Pam)', color: 'bg-mint-50' },
  { id: 'delegar',       label: '🤝 Para Delegar',      color: 'bg-blue-50' },
  { id: 'admin',         label: '📁 Administrativo',    color: 'bg-gray-50' },
];

const PRIORITY_COLORS: Record<string, string> = {
  critical: 'bg-red-100 text-red-700',
  high:     'bg-orange-100 text-orange-700',
  medium:   'bg-blue-100 text-blue-700',
  low:      'bg-gray-100 text-gray-700',
};

type Project = { id: string; name: string; };

type Task = {
  id: string; title: string; status: string; priority: string;
  type: 'ONE_TIME' | 'DAILY';
  dueDate?: string; description?: string; projectId?: string;
  subtasks?: { id: string; title: string; done: boolean }[];
};

type KanbanBoard = Record<string, Task[]>;

const EMPTY_FORM = { title: '', description: '', priority: 'medium', status: 'todo', type: 'ONE_TIME', dueDate: '', projectId: '' };

export default function Tasks() {
  const [board, setBoard]         = useState<KanbanBoard>({ todo: [], doing: [], blocked: [], review: [], done: [] });
  const [aiBoard, setAiBoard]     = useState<Record<string, Task[]>>({});
  const [projects, setProjects]   = useState<Project[]>([]);
  const [loading, setLoading]     = useState(true);
  const [organizing, setOrganizing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editTask, setEditTask]   = useState<Task | null>(null);
  const [form, setForm]           = useState(EMPTY_FORM);
  const [saving, setSaving]       = useState(false);
  const [deleting, setDeleting]   = useState<string | null>(null);
  const [viewMode, setViewMode]   = useState<'kanban' | 'ai'>('kanban');

  const fetchKanban = async () => {
    setLoading(true);
    try {
      const { data } = await api.get<KanbanBoard>('/tasks/kanban');
      setBoard(data);
    } finally { setLoading(false); }
  };

  const fetchProjects = async () => {
    try {
      const { data } = await api.get('/projects');
      setProjects(data);
    } catch { /* silencioso */ }
  };

  useEffect(() => {
    fetchKanban();
    fetchProjects();
  }, []);

  const organizeWithAi = async () => {
    setOrganizing(true);
    try {
      const { data } = await api.post('/ai/organize-tasks');
      setAiBoard(data.blocks);
      setViewMode('ai');
    } catch (e) {
      console.error(e);
      alert("Error al organizar con IA. Asegúrate de que el backend está corriendo.");
    } finally {
      setOrganizing(false);
    }
  };

  const getProjectName = (projectId?: string) => {
    if (!projectId) return null;
    const project = projects.find(p => p.id === projectId);
    return project ? project.name : null;
  };

  const openCreate = () => {
    setEditTask(null);
    setForm(EMPTY_FORM);
    setShowModal(true);
  };

  const openEdit = (task: Task) => {
    setEditTask(task);
    setForm({
      title: task.title,
      description: task.description || '',
      priority: task.priority,
      status: task.status,
      type: task.type || 'ONE_TIME',
      dueDate: task.dueDate ? task.dueDate.split('T')[0] : '',
      projectId: task.projectId || '',
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        projectId: form.projectId || null,
        dueDate: form.dueDate ? new Date(form.dueDate).toISOString() : null,
      };
      if (editTask) {
        await api.patch(`/tasks/${editTask.id}`, payload);
      } else {
        await api.post('/tasks', payload);
      }
      setShowModal(false);
      fetchKanban();
      if (viewMode === 'ai') organizeWithAi(); // Refrescar vista IA si estábamos en ella
    } finally { setSaving(false); }
  };

  const handleDelete = async (taskId: string) => {
    if (!confirm('¿Eliminar esta tarea?')) return;
    setDeleting(taskId);
    try {
      await api.delete(`/tasks/${taskId}`);
      fetchKanban();
      if (viewMode === 'ai') organizeWithAi();
    } finally { setDeleting(null); }
  };

  const onDragEnd = async (result: DropResult) => {
    const { source, destination, draggableId } = result;
    if (!destination || source.droppableId === destination.droppableId) return;
    const newBoard = { ...board };
    const task = newBoard[source.droppableId].find(t => t.id === draggableId)!;
    newBoard[source.droppableId] = newBoard[source.droppableId].filter(t => t.id !== draggableId);
    newBoard[destination.droppableId] = [{ ...task, status: destination.droppableId }, ...newBoard[destination.droppableId]];
    setBoard(newBoard);
    await api.patch(`/tasks/${draggableId}/status`, { status: destination.droppableId });
  };

  if (loading) return <div className="p-8 text-center text-gray-500 font-light">Cargando tareas...</div>;

  const renderTaskCard = (task: Task, prov?: any) => (
    <div
      {...(prov ? { ref: prov.innerRef, ...prov.draggableProps, ...prov.dragHandleProps } : {})}
      className="bg-white rounded-lg p-4 shadow-sm border border-gray-100 cursor-grab group transition-shadow hover:shadow-md"
    >
      <div className="flex justify-between items-start gap-2">
        <p className="text-sm font-medium text-anthracite-light flex-1 leading-snug">{task.title}</p>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition duration-200">
          <button onClick={() => openEdit(task)} className="text-gray-400 hover:text-mint-600 transition" title="Editar">
            <Pencil size={14} />
          </button>
          <button onClick={() => handleDelete(task.id)} disabled={deleting === task.id}
            className="text-gray-400 hover:text-red-400 transition" title="Eliminar">
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2 mt-1">
        {task.type === 'DAILY' ? (
          <span className="flex items-center gap-1 text-[10px] text-mint-600 bg-mint-50 px-1.5 py-0.5 rounded font-bold uppercase tracking-tighter">
            <Sparkles size={10} /> Diaria (L-V)
          </span>
        ) : (
          <span className="text-[10px] text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded font-bold uppercase tracking-tighter">
            Única vez
          </span>
        )}
      </div>

      {getProjectName(task.projectId) && (
        <p className="text-xs text-mint-700 font-medium mt-2 truncate">
          {getProjectName(task.projectId)}
        </p>
      )}

      <div className="flex items-center justify-between mt-3">
        <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded-full ${PRIORITY_COLORS[task.priority] || 'bg-gray-100'}`}>
          {task.priority}
        </span>
        {task.subtasks && task.subtasks.length > 0 && (
          <span className="text-xs text-gray-400 font-medium">{task.subtasks.filter(s => s.done).length}/{task.subtasks.length} ✓</span>
        )}
      </div>
      {task.dueDate && (
        <p className="text-xs text-gray-400 mt-2 font-medium">📅 {new Date(task.dueDate).toLocaleDateString('es-ES')}</p>
      )}
    </div>
  );

  return (
    <div className="p-6 max-w-[1600px] mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-light text-anthracite-dark">Gestión de Tareas</h1>
          <p className="text-gray-500 mt-1 font-medium text-sm">Organiza tu mente, ejecuta sin fricción.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => { setViewMode('kanban'); fetchKanban(); }} 
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition ${viewMode === 'kanban' ? 'bg-anthracite-dark text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}
          >
            <LayoutDashboard size={16} /> Kanban Clásico
          </button>
          <button 
            onClick={organizeWithAi} 
            disabled={organizing}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition ${viewMode === 'ai' ? 'bg-mint-600 text-white border border-mint-600' : 'bg-mint-50 text-mint-700 border border-mint-200 hover:bg-mint-100'}`}
          >
            <Sparkles size={16} /> {organizing ? 'Analizando...' : 'Bloques IA'}
          </button>
          <button onClick={openCreate} className="flex items-center gap-2 bg-anthracite-dark text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-anthracite transition shadow-sm">
            <Plus size={18} /> Nueva Tarea
          </button>
        </div>
      </div>

      {viewMode === 'kanban' ? (
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="flex gap-6 overflow-x-auto pb-4">
            {COLUMNS.map(col => (
              <div key={col.id} className={`min-w-72 rounded-2xl p-4 ${col.color} border border-gray-100 flex-shrink-0`}>
                <h2 className="font-semibold text-gray-700 mb-4 flex items-center justify-between">
                  {col.label} <span className="text-xs bg-white px-2 py-1 rounded-full text-gray-500 border border-gray-200">{board[col.id]?.length || 0}</span>
                </h2>
                <Droppable droppableId={col.id}>
                  {provided => (
                    <div ref={provided.innerRef} {...provided.droppableProps} className="min-h-20 space-y-3">
                      {(board[col.id] || []).map((task, index) => (
                        <Draggable key={task.id} draggableId={task.id} index={index}>
                          {prov => renderTaskCard(task, prov)}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                      {(board[col.id] || []).length === 0 && (
                        <p className="text-center text-gray-400 text-xs py-4 font-medium">Todo limpio aquí.</p>
                      )}
                    </div>
                  )}
                </Droppable>
              </div>
            ))}
          </div>
        </DragDropContext>
      ) : (
        <div className="flex gap-6 overflow-x-auto pb-4">
          {AI_COLUMNS.map(col => (
            <div key={col.id} className={`min-w-72 rounded-2xl p-4 ${col.color} border border-gray-100 flex-shrink-0`}>
              <h2 className="font-semibold text-gray-700 mb-4 flex items-center justify-between">
                {col.label} <span className="text-xs bg-white px-2 py-1 rounded-full text-gray-500 border border-gray-200">{aiBoard[col.id]?.length || 0}</span>
              </h2>
              <div className="min-h-20 space-y-3">
                {(aiBoard[col.id] || []).map(task => (
                  <div key={task.id}>{renderTaskCard(task)}</div>
                ))}
                {(aiBoard[col.id] || []).length === 0 && (
                  <p className="text-center text-gray-400 text-xs py-4 font-medium">No hay tareas para este bloque.</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Nueva/Editar Tarea */}
      {showModal && (
        <div className="fixed inset-0 bg-anthracite-dark/20 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all">
          <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl border border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-light text-anthracite-dark">{editTask ? 'Editar Tarea' : 'Crear Tarea'}</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 transition"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-widest text-gray-500 mb-2">Título *</label>
                <input required type="text" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-mint-500 transition shadow-sm" />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-widest text-gray-500 mb-2">Proyecto</label>
                <select value={form.projectId} onChange={e => setForm({ ...form, projectId: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-mint-500 transition shadow-sm">
                  <option value="">Sin proyecto asociado</option>
                  {projects.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-widest text-gray-500 mb-2">Descripción</label>
                <textarea rows={3} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-mint-500 transition shadow-sm resize-none" />
              </div>
              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-widest text-gray-500 mb-2">Prioridad</label>
                  <select value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-mint-500 transition shadow-sm">
                    <option value="low">Baja</option>
                    <option value="medium">Media</option>
                    <option value="high">Alta</option>
                    <option value="critical">Crítica</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-widest text-gray-500 mb-2">Estado</label>
                  <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-mint-500 transition shadow-sm">
                    <option value="todo">Por Hacer</option>
                    <option value="doing">En Proceso</option>
                    <option value="blocked">Bloqueado</option>
                    <option value="review">Revisión</option>
                    <option value="done">Completado</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-widest text-gray-500 mb-2">Tipo de Tarea</label>
                <div className="flex gap-4">
                  <label className={`flex-1 flex items-center justify-center gap-2 p-3 border rounded-xl cursor-pointer transition ${form.type === 'ONE_TIME' ? 'bg-mint-50 border-mint-200 text-mint-700' : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'}`}>
                    <input type="radio" className="hidden" name="type" value="ONE_TIME" checked={form.type === 'ONE_TIME'} onChange={() => setForm({ ...form, type: 'ONE_TIME' })} />
                    <span className="text-sm font-medium">Una vez</span>
                  </label>
                  <label className={`flex-1 flex items-center justify-center gap-2 p-3 border rounded-xl cursor-pointer transition ${form.type === 'DAILY' ? 'bg-purple-50 border-purple-200 text-purple-700' : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'}`}>
                    <input type="radio" className="hidden" name="type" value="DAILY" checked={form.type === 'DAILY'} onChange={() => setForm({ ...form, type: 'DAILY' })} />
                    <span className="text-sm font-medium">Diaria (L-V)</span>
                  </label>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-widest text-gray-500 mb-2">Fecha límite</label>
                <input type="date" value={form.dueDate} onChange={e => setForm({ ...form, dueDate: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-mint-500 transition shadow-sm" />
              </div>
              <div className="flex gap-4 pt-4">
                <button type="submit" disabled={saving}
                  className="flex-1 bg-anthracite-dark text-white rounded-lg py-2.5 text-sm font-medium hover:bg-anthracite transition disabled:opacity-50 shadow-sm">
                  {saving ? 'Guardando...' : editTask ? 'Actualizar Tarea' : 'Crear Tarea'}
                </button>
                <button type="button" onClick={() => setShowModal(false)}
                  className="flex-1 bg-white border border-gray-200 text-gray-700 rounded-lg py-2.5 text-sm font-medium hover:bg-gray-50 transition">
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}