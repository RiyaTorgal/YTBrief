const BulletList = ({ items, title }) => {
    if (!items || items.length === 0) return null;
    return (
      <div className="mb-6">
        <h2 className="font-semibold text-2xl mb-2">{title}:</h2>
        <ul className="list-disk list-inside ml-6 text-gray-700 text-lg space-y-2">
          {items.map((item, index) => (
            <li key={index} className="pl-2">
              <span className="mr-2">•</span>
              <span className="flex-1">{formatText(item)}</span>
            </li>
          ))}
        </ul>
      </div>
    );
  };

    const formatText = (text) => {
    // First handle bold text (wrapped in **)
    const boldFormatted = text.split(/(\*\*.*?\*\*)/).map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        // Remove the ** and wrap in bold
        return <strong key={`bold-${index}`}>{part.slice(2, -2)}</strong>;
      }
      return part;
    });
    // Then handle each part for underline (wrapped in ``)
    return boldFormatted.map((part, index) => {
      if (typeof part === 'string') {
        return part.split(/(`.*?`)/).map((subPart, subIndex) => {
          if (subPart.startsWith('`') && subPart.endsWith('`')) {
            return <strong key={`bold-${index}-${subIndex}`}>{subPart.slice(1, -1)}</strong>;
          }
          return subPart;
        });
      }
      return part;
    });
  };
export default BulletList