// این فایل برای سازگاری با کامپوننت‌های موجود اضافه شده است
// در صورت نیاز می‌توانید کامپوننت‌های kanban را اینجا پیاده‌سازی کنید

export const KanbanProvider = ({ children, ...props }) => {
  return <div {...props}>{children}</div>
}

export const KanbanBoard = ({ children, ...props }) => {
  return <div {...props}>{children}</div>
}

export const KanbanHeader = ({ name, color, count, ...props }) => {
  return (
    <div className="p-4 border-b" {...props}>
      <h3 className="font-semibold">{name}</h3>
      {count !== undefined && <span className="text-sm text-muted-foreground">({count})</span>}
    </div>
  )
}

export const KanbanCards = ({ children, ...props }) => {
  return <div className="p-4 space-y-2" {...props}>{children}</div>
}

export const KanbanCard = ({ children, name, onClick, ...props }) => {
  return (
    <div 
      className="p-3 bg-white border rounded-lg cursor-pointer hover:shadow-md transition-shadow"
      onClick={onClick}
      {...props}
    >
      {children}
    </div>
  )
}