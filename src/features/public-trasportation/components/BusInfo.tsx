import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface BusInfoProps {
  route: string;
  from: string;
  to: string;
  duration: string;
  fare: string;
  gpsAvailable?: boolean;
  stops: string[];
}

export default function BusInfo({
  route,
  from,
  to,
  duration,
  fare,
  gpsAvailable = true,
  stops,
}: BusInfoProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-xl bg-blue-800">
      {/* Header */}
      <div
        className="flex cursor-pointer items-center justify-between p-3 select-none"
        onClick={() => setOpen(!open)}
        onMouseDown={(e) => e.preventDefault()}
        tabIndex={-1}
      >
        <div>
          <p className="text-sm font-semibold">{route}</p>
          <p className="text-xs text-blue-200">
            {from} → {to}
          </p>
        </div>

        <div className="flex flex-col items-end space-y-1">
          {/* แสดง Duration ที่ส่งมา */}
          <div className="rounded-md bg-blue-600 px-2 py-1 text-xs">
            {duration}
          </div>
          {/* แสดงค่าโดยสาร/Tap In/Out */}
          <div
            className={`flex items-center gap-1 rounded-md px-2 py-[2px] text-[10px] font-medium ${fare === 'Tap In/Out' ? 'bg-gray-500' : 'bg-green-500'}`}
          >
            <span>{fare}</span>
          </div>
        </div>
      </div>

      {/* Expanded stop list */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="stops"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.35, ease: 'easeInOut' }}
            className="space-y-3 rounded-b-xl bg-white px-6 py-4 text-gray-800 select-none"
            onMouseDown={(e) => e.preventDefault()}
            tabIndex={-1}
          >
            {stops.map((stop, index) => (
              <div
                key={index}
                className="flex items-center gap-3 select-none"
                onMouseDown={(e) => e.preventDefault()}
                tabIndex={-1}
              >
                <div className="flex flex-col items-center">
                  <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                  {index !== stops.length - 1 && (
                    <div className="h-6 w-[2px] bg-blue-300"></div>
                  )}
                </div>
                <p className="text-sm select-none">{stop}</p>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
