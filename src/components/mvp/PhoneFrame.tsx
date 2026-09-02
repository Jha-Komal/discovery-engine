import type { ReactNode } from 'react';

export function PhoneFrame({ children }: { children: ReactNode }) {
  return (
    <div
      className="relative mx-auto rounded-[52px] bg-black p-3 shadow-2xl"
      style={{ width: 375, height: 760 }}
    >
      <div
        className="relative h-full w-full overflow-hidden bg-white"
        style={{ borderRadius: 44 }}
      >
        <div
          className="absolute left-1/2 top-2 z-30 -translate-x-1/2 rounded-full bg-black"
          style={{ width: 120, height: 34 }}
        />
        <div className="h-full w-full overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
          {children}
        </div>
      </div>
    </div>
  );
}
