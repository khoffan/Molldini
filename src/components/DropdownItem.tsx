import React from 'react'
import { Link } from 'react-router';

// Component ย่อยสำหรับแต่ละเมนูใน Dropdown
function DropdownItem({ to, icon, label, color = "text-gray-700" }: { to: string, icon: string, label: string, color?: string }) {
    return (
        <Link
            to={to}
            className={`px-4 py-2 text-sm ${color} hover:bg-gray-50 flex items-center space-x-2 transition-colors`}
        >
            <svg className="h-4 w-4 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icon} />
            </svg>
            <span>{label}</span>
        </Link>
    );
}

export default DropdownItem