import './DescriptionWithMentions.css';

function DescriptionWithMentions({ description }) {
  if (!description) return null;
  
  // تبدیل mentions به JSX
  const renderDescription = () => {
    // Regex برای پیدا کردن mentions: @[Name](id)
    const mentionRegex = /@\[([^\]]+)\]\(([^)]+)\)/g;
    
    const parts = [];
    let lastIndex = 0;
    let match;
    
    while ((match = mentionRegex.exec(description)) !== null) {
      // متن قبل از mention
      if (match.index > lastIndex) {
        parts.push({
          type: 'text',
          content: description.substring(lastIndex, match.index),
          key: `text-${lastIndex}`
        });
      }
      
      // mention
      parts.push({
        type: 'mention',
        name: match[1],
        userId: match[2],
        key: `mention-${match.index}`
      });
      
      lastIndex = match.index + match[0].length;
    }
    
    // متن بعد از آخرین mention
    if (lastIndex < description.length) {
      parts.push({
        type: 'text',
        content: description.substring(lastIndex),
        key: `text-${lastIndex}`
      });
    }
    
    return parts;
  };
  
  const parts = renderDescription();
  
  return (
    <div className="description-with-mentions">
      {parts.map((part) => {
        if (part.type === 'text') {
          return <span key={part.key}>{part.content}</span>;
        } else {
          return (
            <span 
              key={part.key} 
              className="mention" 
              data-user-id={part.userId}
              title={`کاربر: ${part.name}`}
            >
              @{part.name}
            </span>
          );
        }
      })}
    </div>
  );
}

export default DescriptionWithMentions;
