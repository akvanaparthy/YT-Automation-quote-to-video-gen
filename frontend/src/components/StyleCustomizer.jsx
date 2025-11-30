/**
 * Style Customizer Component
 * Allows users to customize text appearance
 */

import { useState, useEffect } from 'react';
import { getAvailableFonts, getAvailableAnimations } from '../services/api';

const POSITIONS = ['top', 'center', 'bottom'];

export default function StyleCustomizer({ onChange }) {
  const [fonts, setFonts] = useState(['Arial']);
  const [animations, setAnimations] = useState(['none']);
  const [style, setStyle] = useState({
    fontFamily: 'Arial',
    fontSize: 60,
    fontColor: '#FFFFFF',
    position: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    animation: 'none'
  });
  const [options, setOptions] = useState({
    addMusic: true,
    autoDelete: true,
    maxDuration: null
  });

  useEffect(() => {
    // Fetch available fonts and animations
    const fetchOptions = async () => {
      try {
        const [fontsData, animationsData] = await Promise.all([
          getAvailableFonts(),
          getAvailableAnimations()
        ]);
        if (fontsData.success) setFonts(fontsData.fonts);
        if (animationsData.success) setAnimations(animationsData.animations);
      } catch (err) {
        console.error('Error fetching options:', err);
      }
    };
    fetchOptions();
  }, []);

  const handleChange = (field, value) => {
    const newStyle = { ...style, [field]: value };
    setStyle(newStyle);
    onChange(newStyle, options);
  };

  const handleOptionChange = (field, value) => {
    const newOptions = { ...options, [field]: value };
    setOptions(newOptions);
    onChange(style, newOptions);
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
          {fonts.map(font => (
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
          {animations.map(anim => (
            <option key={anim} value={anim}>
              {anim.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
            </option>
          ))}
        </select>
      </div>

      <h3>Video Options</h3>

      <div className="form-group">
        <label>
          <input
            type="checkbox"
            checked={options.addMusic}
            onChange={(e) => handleOptionChange('addMusic', e.target.checked)}
          />
          Add Background Music
        </label>
      </div>

      <div className="form-group">
        <label>
          <input
            type="checkbox"
            checked={options.autoDelete}
            onChange={(e) => handleOptionChange('autoDelete', e.target.checked)}
          />
          Auto-delete after 24 hours
        </label>
      </div>

      <div className="form-group">
        <label htmlFor="maxDuration">Max Duration (seconds):</label>
        <input
          id="maxDuration"
          type="number"
          min="1"
          max="300"
          placeholder="Original length"
          value={options.maxDuration || ''}
          onChange={(e) => handleOptionChange('maxDuration', e.target.value ? parseInt(e.target.value) : null)}
        />
      </div>
    </div>
  );
}
