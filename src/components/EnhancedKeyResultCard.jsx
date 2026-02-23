import { useState, useMemo, memo } from 'react';
import { formatValueWithUnit } from '../constants/keyResultUnits';
import KeyResultProgressModal from './KeyResultProgressModal';
import KeyResultAttachments from './KeyResultAttachments';
import './EnhancedKeyResultCard.css';

const EnhancedKeyResultCard = memo(({ 
  keyResult, 
  token, 
  onEdit, 
  onDelete, 
  onUpdate,
  isCreator 
}) => {
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [showAttachments, setShowAttachments] = useState(false);

  // Memoize calculations for performance
  const currentValue = useMemo(() => 
    keyResult.current_value ?? keyResult.initial_value ?? 0,
    [keyResult.current_value, keyResult.initial_value]
  );
  
  const targetValue = useMemo(() => 
    keyResult.target_value || 100,
    [keyResult.target_value]
  );
  
  const progress = useMemo(() => 
    Math.min(100, Math.round((currentValue / targetValue) * 100)),
    [currentValue, targetValue]
  );

  const getProgressColor = () => {
    if (progress >= 70) return '';
    if (progress >= 40) return 'warning';
    return 'danger';
  };

  // Memoize date calculations
  const daysUntilDue = useMemo(() => {
    if (!keyResult.due_date) return null;
    const today = new Date();
    const dueDate = new Date(keyResult.due_date);
    const diffTime = dueDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }, [keyResult.due_date]);

  const dueDateStatus = useMemo(() => {
    if (daysUntilDue === null) return null;
    if (daysUntilDue < 0) return 'overdue';
    if (daysUntilDue < 7) return 'urgent';
    if (daysUntilDue < 14) return 'warning';
    return 'normal';
  }, [daysUntilDue]);

  return (
    <>
      <div className="enhanced-kr-card">
        <div className="kr-card-header">
          <div className="kr-title-section">
            <h4 className="kr-card-title">{keyResult.title}</h4>
            
            {keyResult.description && (
              <p className="kr-description">{keyResult.description}</p>
            )}

            <div className="kr-badges">
              {keyResult.owner && (
                <span className="kr-badge owner">
                  👤 {keyResult.owner.full_name}
                </span>
              )}
              
              {keyResult.due_date && (
                <span className={`kr-badge due-date ${dueDateStatus}`}>
                  📅 {new Date(keyResult.due_date).toLocaleDateString('fa-IR')}
                  {daysUntilDue !== null && (
                    <span>
                      {daysUntilDue < 0 
                        ? ` (${Math.abs(daysUntilDue)} روز گذشته)` 
                        : ` (${daysUntilDue} روز مانده)`
                      }
                    </span>
                  )}
                </span>
              )}

              {keyResult.labels && keyResult.labels.map(label => (
                <span key={label} className="kr-badge label">
                  🏷️ {label}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="kr-progress-section">
          <div className="kr-values">
            <div className="kr-value-item">
              <span className="kr-value-label">مقدار فعلی</span>
              <span className="kr-value-number">
                {formatValueWithUnit(currentValue, keyResult.unit)}
              </span>
            </div>
            <div className="kr-value-item">
              <span className="kr-value-label">مقدار هدف</span>
              <span className="kr-value-number">
                {formatValueWithUnit(targetValue, keyResult.unit)}
              </span>
            </div>
          </div>

          <div className="kr-progress-bar-container">
            <div 
              className={`kr-progress-bar-fill ${getProgressColor()}`}
              style={{ width: `${progress}%` }}
            >
              {progress > 10 && (
                <span className="kr-progress-text">{progress}%</span>
              )}
            </div>
          </div>
        </div>

        <div className="kr-card-actions">
          <button 
            className="btn-kr-action primary"
            onClick={() => setShowProgressModal(true)}
          >
            📈 ثبت پیشرفت
          </button>
          
          <button 
            className="btn-kr-action"
            onClick={() => setShowAttachments(!showAttachments)}
          >
            📎 فایل‌ها
          </button>

          {isCreator && (
            <>
              <button 
                className="btn-kr-action"
                onClick={onEdit}
              >
                ✏️ ویرایش
              </button>
              
              <button 
                className="btn-kr-action"
                onClick={onDelete}
              >
                🗑️ حذف
              </button>
            </>
          )}
        </div>

        {showAttachments && (
          <KeyResultAttachments 
            keyResultId={keyResult.id} 
            token={token} 
          />
        )}
      </div>

      {showProgressModal && (
        <KeyResultProgressModal
          isOpen={showProgressModal}
          onClose={() => setShowProgressModal(false)}
          keyResult={keyResult}
          token={token}
          onSuccess={() => {
            setShowProgressModal(false);
            if (onUpdate) onUpdate();
          }}
        />
      )}
    </>
  );
}, (prevProps, nextProps) => {
  // Custom comparison for memo optimization
  return (
    prevProps.keyResult.id === nextProps.keyResult.id &&
    prevProps.keyResult.current_value === nextProps.keyResult.current_value &&
    prevProps.keyResult.title === nextProps.keyResult.title &&
    prevProps.keyResult.due_date === nextProps.keyResult.due_date &&
    prevProps.isCreator === nextProps.isCreator
  );
});

EnhancedKeyResultCard.displayName = 'EnhancedKeyResultCard';

export default EnhancedKeyResultCard;
