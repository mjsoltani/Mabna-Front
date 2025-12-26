import React from 'react'
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
  useDroppable,
} from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable'
import {
  CSS,
} from '@dnd-kit/utilities'
import { cn } from '@/lib/utils'

export const KanbanProvider = ({ children, onDragEnd, className, ...props }) => {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  )

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragEnd={onDragEnd}
    >
      <div className={cn("flex gap-6 overflow-x-auto pb-4", className)} {...props}>
        {children}
      </div>
    </DndContext>
  )
}

export const KanbanBoard = ({ children, id, ...props }) => {
  return (
    <div 
      id={id}
      className="flex-shrink-0 w-80 bg-gray-50 rounded-lg" 
      {...props}
    >
      {children}
    </div>
  )
}

export const KanbanHeader = ({ name, color, count, ...props }) => {
  return (
    <div className="p-4 border-b bg-white rounded-t-lg" {...props}>
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-900">{name}</h3>
        {count !== undefined && (
          <span 
            className="px-2 py-1 text-xs font-medium text-white rounded-full"
            style={{ backgroundColor: color }}
          >
            {count}
          </span>
        )}
      </div>
    </div>
  )
}

export const KanbanCards = ({ children, id, ...props }) => {
  const { setNodeRef, isOver } = useDroppable({
    id: id,
  })

  return (
    <div 
      ref={setNodeRef}
      className={cn(
        "p-4 space-y-3 min-h-[200px] transition-colors",
        isOver && "bg-blue-50"
      )} 
      {...props}
    >
      {children}
    </div>
  )
}

export const KanbanCard = ({ children, id, name, parent, index, onClick, ...props }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: id,
    data: {
      type: 'task',
      task: { id, name, status: parent },
    },
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(
        "p-3 bg-white border rounded-lg cursor-pointer hover:shadow-md transition-all duration-200",
        isDragging && "opacity-50 rotate-2 shadow-lg"
      )}
      onClick={onClick}
      {...props}
    >
      {children}
    </div>
  )
}