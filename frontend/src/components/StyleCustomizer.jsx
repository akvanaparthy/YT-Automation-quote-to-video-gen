/**
 * Style Customizer Component
 * Allows users to customize text appearance
 */

import { useState } from 'react';

const FONTS = ['Arial', 'Times New Roman', 'Courier New'];
const POSITIONS = ['top', 'center', 'bottom'];
const ANIMATIONS = ['none', 'fade', 'slide'];

export default function StyleCustomizer({ onChange }) {
  const [style, setStyle] = useState({
    fontFamily: 'Arial',
    fontSize: 60,
    fontColor: '#FFFFFF',
    position: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    animation: 'none'
  });

  const handleChange = (field, value) => {
    const newStyle = { ...style, [field]: value };
    setStyle(newStyle);
    onChange(newStyle);
  };

  return (
    <div className="style-customizer">
      <h3>Text Styling</h3>

      <div className="form-group">
        <label htmlFor="fontFamily">Font Family:</label>
        <select
          id="fontFamily"
          value={style.fontFamily}
          onChange={(e) => handleChange('fontFamily', e.target.value)}
        >
          {FONTS.map(font => (
            <option key={font} value={font}>{font}</option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="fontSize">Font Size: {style.fontSize}px</label>
        <input
          id="fontSize"
          type="range"
          min="20"
          max="120"
          value={style.fontSize}
          onChange={(e) => handleChange('fontSize', parseInt(e.target.value))}
        />
      </div>

      <div className="form-group">
        <label htmlFor="fontColor">Font Color:</label>
        <input
          id="fontColor"
          type="color"
          value={style.fontColor}
          onChange={(e) => handleChange('fontColor', e.target.value)}
        />
      </div>

      <div className="form-group">
        <label htmlFor="position">Position:</label>
        <select
          id="position"
          value={style.position}
          onChange={(e) => handleChange('position', e.target.value)}
        >
          {POSITIONS.map(pos => (
            <option key={pos} value={pos}>{pos.charAt(0).toUpperCase() + pos.slice(1)}</option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="animation">Animation:</label>
        <select
          id="animation"
          value={style.animation}
          onChange={(e) => handleChange('animation', e.target.value)}
        >
          {ANIMATIONS.map(anim => (
            <option key={anim} value={anim}>{anim.charAt(0).toUpperCase() + anim.slice(1)}</option>
          ))}
        </select>
      </div>
    </div>
  );
}
