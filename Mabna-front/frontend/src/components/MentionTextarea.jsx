import { useState, useRef, useEffect } from 'react';
import './MentionTextarea.css';

function MentionTextarea({ value, onChange, users, placeholder, rows = 5 }) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [mentionStart, setMentionStart] = useState(-1);
  const textareaRef = useRef(null);
  const suggestionsRef = useRef(null);

  useEffect(() => {
    // Scroll to selected item
    if (suggestionsRef.current && showSuggestions) {
      const selectedElement = suggestionsRef.current.children[selectedIndex];
      if (selectedElement) {
        selectedElement.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [selectedIndex, showSuggestions]);

  const handleChange = (e) => {
    const text = e.target.value;
    const cursorPos = e.target.selectionStart;
    
    onChange(text);
    
    // پیدا کردن @ قبل از cursor
    const textBeforeCursor = text.substring(0, cursorPos);
    const lastAtIndex = textBeforeCursor.lastIndexOf('@');
    
    if (lastAtIndex !== -1) {
      const textAfterAt = textBeforeCursor.substring(lastAtIndex + 1);
      
      // چک کن که بعد از @ فاصله یا خط جدید نباشه
      if (!textAfterAt.includes(' ') && !textAfterAt.includes('\n')) {
        setMentionStart(lastAtIndex);
        
        // فیلتر کردن users
        const query = textAfterAt.toLowerCase();
        const filtered = users.filter(user =>
          user.full_name.toLowerCase().includes(query)
        );
        
        setSuggestions(filtered);
        setShowSuggestions(filtered.length > 0);
        setSelectedIndex(0);
      } else {
        setShowSuggestions(false);
      }
    } else {
      setShowSuggestions(false);
    }
  };

  const insertMention = (user) => {
    if (mentionStart === -1) return;
    
    const text = value;
    const cursorPos = textareaRef.current.selectionStart;
    
    // ساخت mention
    const mention = `@[${user.full_name}](${user.user_id})`;
    
    // جایگزین کردن @query با mention
    const newText = 
      text.substring(0, mentionStart) + 
      mention + 
      ' ' +
      text.substring(cursorPos);
    
    onChange(newText);
    setShowSuggestions(false);
    
    // تنظیم cursor بعد از mention
    setTimeout(() => {
      const newCursorPos = mentionStart + mention.length + 1;
      textareaRef.current.setSelectionRange(newCursorPos, newCursorPos);
      textareaRef.current.focus();
    }, 0);
  };

  const handleKeyDown = (e) => {
    if (!showSuggestions) return;
    
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
        
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : 0);
        break;
        
      case 'Enter':
        if (showSuggestions && suggestions[selectedIndex]) {
          e.preventDefault();
          insertMention(suggestions[selectedIndex]);
        }
        break;
        
      case 'Escape':
        e.preventDefault();
        setShowSuggestions(false);
        break;
        
      default:
        break;
    }
  };

  return (
    <div className="mention-textarea-container">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        rows={rows}
        className="mention-textarea"
      />
      
      {showSuggestions && suggestions.length > 0 && (
        <div className="mention-suggestions" ref={suggestionsRef}>
          {suggestions.map((user, index) => (
            <div
              key={user.user_id}
              className={`mention-suggestion-item ${index === selectedIndex ? 'selected' : ''}`}
              onClick={() => insertMention(user)}
              onMouseEnter={() => setSelectedIndex(index)}
            >
              <div className="user-avatar">
                {user.full_name.charAt(0)}
              </div>
              <div className="user-info">
                <div className="user-name">{user.full_name}</div>
                <div className="user-email">{user.email}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MentionTextarea;
