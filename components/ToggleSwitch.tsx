
import React from 'react';

interface ToggleSwitchProps {
  enabled: boolean;
  setEnabled: (enabled: boolean) => void;
  disabled?: boolean;
}

export const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ enabled, setEnabled, disabled }) => {
  return (
    <button
      type="button"
      onClick={() => setEnabled(!enabled)}
      disabled={disabled}
      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-neutral/50 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-base-100 disabled:cursor-not-allowed disabled:opacity-50 ${
        enabled ? 'bg-primary' : 'bg-neutral/40'
      }`}
      role="switch"
      aria-checked={enabled}
    >
      <span
        aria-hidden="true"
        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
          enabled ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
    </button>
  );
};
