'use client';

import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import {
  DndContext,
  rectIntersection,
  useDraggable,
  useDroppable,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';

export const KanbanBoard = ({ id, children, className }) => {
  const { isOver, setNodeRef } = useDroppable({ id });

  return (
    <div
      className={cn(
        'flex h-full min-h-40 flex-col gap-2 rounded-md border bg-secondary p-2 text-xs shadow-sm outline outline-2 transition-all',
        isOver ? 'outline-primary' : 'outline-transparent',
        className
      )}
      ref={setNodeRef}
    >
      {children}
    </div>
  );
};

export const KanbanCard = ({
  id,
  name,
  index,
  parent,
  children,
  className,
  onClick,
}) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id,
      data: { index, parent },
    });

  const handleClick = (e) => {
    // فقط اگر drag نشده بود، کلیک رو اجرا کن
    if (!isDragging && onClick) {
      onClick(e);
    }
  };

  return (
    <Card
      className={cn(
        'rounded-md p-3 shadow-sm cursor-grab',
        isDragging && 'cursor-grabbing opacity-50 z-50',
        className
      )}
      style={{
        transform: transform
          ? `translateX(${transform.x}px) translateY(${transform.y}px)`
          : 'none',
      }}
      {...listeners}
      {...attributes}
      ref={setNodeRef}
      onClick={handleClick}
    >
      {children ?? <p className="m-0 font-medium text-sm">{name}</p>}
    </Card>
  );
};

export const KanbanCards = ({ children, className }) => (
  <div className={cn('flex flex-1 flex-col gap-2', className)}>{children}</div>
);

export const KanbanHeader = (props) =>
  'children' in props ? (
    props.children
  ) : (
    <div className={cn('flex shrink-0 items-center gap-2', props.className)}>
      <div
        className="h-2 w-2 rounded-full"
        style={{ backgroundColor: props.color }}
      />
      <p className="m-0 font-semibold text-sm">{props.name}</p>
      {props.count !== undefined && (
        <span className="text-xs text-muted-foreground">({props.count})</span>
      )}
    </div>
  );

export const KanbanProvider = ({
  children,
  onDragEnd,
  className,
}) => {
  // تنظیم sensor با فاصله فعال‌سازی برای تفکیک کلیک از drag
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // حداقل 8 پیکسل حرکت برای شروع drag
      },
    })
  );

  return (
    <DndContext 
      sensors={sensors}
      collisionDetection={rectIntersection} 
      onDragEnd={onDragEnd}
    >
      <div
        className={cn('grid w-full auto-cols-fr grid-flow-col gap-4', className)}
      >
        {children}
      </div>
    </DndContext>
  );
};
