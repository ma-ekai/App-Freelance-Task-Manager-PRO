import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Plus, Pencil, Trash2, X } from 'lucide-react';
import api from '../api';

const COLUMNS = [
  { id: 'todo',    label: '📋 To Do',   color: 'bg-gray-100' },
  { id: 'doing',   label: '⚡ Doing',   color: 'bg-blue-100' },
  { id: 'blocked', label: '🚫 Blocked', color: 'bg-red-100' },
  { id: 'review',  label: '👁 Review',  color: 'bg-yellow-100' },
  { id: 'done',    label: '✅ Done',    color: 'bg-green-100' },
];

const PRIORITY_COLORS: Record<string, string> = {
  critical: 'bg-red-500 text-white',
  high:     'bg-orange-400 text-white',
  medium:   'bg-blue-400 text-white',
  low:      'bg-gray-400 text-white',
};

type Task = {
  id: string; title: string; status: string; priority: string;
  dueDate?: string; description?: string; projectId?: string;
  subtasks?: { id: string; title: string; done: boolean }[];
};

type KanbanBoard = Record<string, Task[]>;

const EMPTY_FORM = { title: '', description: '', priority: 'medium', status: 'todo', dueDate: '' };

export default function Tasks() {
  const [board, setBoard]         = useState<KanbanBoard>({ todo: [], doing: [], blocked: [], review: [], done: [] });
  const [loading, setLoading]     = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editTask, setEditTask]   = useState<Task | null>(null);
  const [form, setForm]           = useState(EMPTY_FORM);
  const [saving, setSaving]       = useState(false);
  const [deleting, setDeleting]   = useState<string | null>(null);

  const fetchKanban = async () => {
    setLoading(true);
    try {
      const { data } = await api.get<KanbanBoard>('/tasks/kanban');
      setBoard(data);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchKanban(); }, []);

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
      dueDate: task.dueDate ? task.dueDate.split('T')[0] : '',
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        dueDate: form.dueDate ? new Date(form.dueDate).toISOString() : null,
      };
      if (editTask) {
        await api.patch(`/tasks/${editTask.id}`, payload);
      } else {
        await api.post('/tasks', payload);
      }
      setShowModal(false);
      fetchKanban();
    } finally { setSaving(false); }
  };

  const handleDelete = async (taskId: string) => {
    if (!confirm('¿Eliminar esta tarea?')) return;
    setDeleting(taskId);
    try {
      await api.delete(`/tasks/${taskId}`);
      fetchKanban();
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

  if (loading) return <div className="p-8 text-center text-gray-500">Cargando tablero…</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Tablero Kanban</h1>
        <button onClick={openCreate} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition">
          <Plus size={18} /> Nueva tarea
        </button>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex gap-4 overflow-x-auto pb-4">
          {COLUMNS.map(col => (
            <div key={col.id} className={`min-w-64 rounded-xl p-3 ${col.color} flex-shrink-0`}>
              <h2 className="font-semibold text-gray-700 mb-3">
                {col.label} <span className="text-sm text-gray-500">({board[col.id]?.length || 0})</span>
              </h2>
              <Droppable droppableId={col.id}>
                {provided => (
                  <div ref={provided.innerRef} {...provided.droppableProps} className="min-h-20 space-y-2">
                    {(board[col.id] || []).map((task, index) => (
                      <Draggable key={task.id} draggableId={task.id} index={index}>
                        {prov => (
                          <div ref={prov.innerRef} {...prov.draggableProps} {...prov.dragHandleProps}
                            className="bg-white rounded-lg p-3 shadow-sm border border-gray-200 cursor-grab group">
                            <div className="flex justify-between items-start gap-2">
                              <p className="text-sm font-medium text-gray-800 flex-1">{task.title}</p>
                              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition">
                                <button onClick={() => openEdit(task)} className="text-gray-400 hover:text-blue-600 transition" title="Editar">
                                  <Pencil size={14} />
                                </button>
                                <button onClick={() => handleDelete(task.id)} disabled={deleting === task.id}
                                  className="text-gray-400 hover:text-red-500 transition" title="Eliminar">
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </div>
                            <div className="flex items-center justify-between mt-2">
                              <span className={`text-xs px-2 py-0.5 rounded-full ${PRIORITY_COLORS[task.priority] || 'bg-gray-300'}`}>
                                {task.priority}
                              </span>
                              {task.subtasks && task.subtasks.length > 0 && (
                                <span className="text-xs text-gray-500">{task.subtasks.filter(s => s.done).length}/{task.subtasks.length} ✓</span>
                              )}
                            </div>
                            {task.dueDate && (
                              <p className="text-xs text-gray-400 mt-1">📅 {new Date(task.dueDate).toLocaleDateString('es-ES')}</p>
                            )}
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                    {(board[col.id] || []).length === 0 && (
                      <p className="text-center text-gray-400 text-xs py-4">Sin tareas</p>
                    )}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-gray-800">{editTask ? 'Editar tarea' : 'Nueva tarea'}</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Título *</label>
                <input required type="text" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                <textarea rows={3} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Prioridad</label>
                  <select value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400">
                    <option value="low">Baja</option>
                    <option value="medium">Media</option>
                    <option value="high">Alta</option>
                    <option value="critical">Crítica</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                  <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400">
                    <option value="todo">To Do</option>
                    <option value="doing">Doing</option>
                    <option value="blocked">Blocked</option>
                    <option value="review">Review</option>
                    <option value="done">Done</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha límite</label>
                <input type="date" value={form.dueDate} onChange={e => setForm({ ...form, dueDate: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={saving}
                  className="flex-1 bg-blue-600 text-white rounded-lg py-2 text-sm font-medium hover:bg-blue-700 transition disabled:opacity-50">
                  {saving ? 'Guardando…' : editTask ? 'Guardar cambios' : 'Crear tarea'}
                </button>
                <button type="button" onClick={() => setShowModal(false)}
                  className="flex-1 border border-gray-300 text-gray-700 rounded-lg py-2 text-sm font-medium hover:bg-gray-50 transition">
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
