export default function ToggleSwitch({ label, checked, onChange, id }) {
  return (
    <div className="toggle-container">
      <label htmlFor={id}>{label}</label>
      <label className="switch" style={{ display: 'inline-block', position: 'relative', width: '60px', height: '30px' }}>
        <input
          type="checkbox"
          id={id}
          checked={checked}
          onChange={onChange}
          style={{ opacity: 0, width: 0, height: 0 }}
        />
        <span
          className="slider"
          style={{
            position: 'absolute',
            cursor: 'pointer',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: checked ? 'var(--primary)' : '#ccc',
            borderRadius: '34px',
            transition: '.4s',
          }}
        >
          <span
            style={{
              position: 'absolute',
              content: '""',
              height: '22px',
              width: '22px',
              left: checked ? '34px' : '4px',
              bottom: '4px',
              backgroundColor: 'white',
              borderRadius: '50%',
              transition: '.4s',
            }}
          />
        </span>
      </label>
    </div>
  );
}