import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

interface StatCardProps {
    label: string;
    value: string | number;
    icon: React.ReactNode;
    color?: string;
}

export default function StatCard ({label, value, icon, color}: StatCardProps) {
    return (
        <Card className='shadow-sm bg-white border border-gray-200 w-128 h-32 m-4 '>
            <CardContent className='flex items-center justify-between pl-4 pr-4 pt-2 pb-4'>
                <div>
                    <p className='text-lg font-medium text-blue-500 uppercase tracking-wide'>{label}</p>
                    <p className="text-2xl font-bold mt-1">{value}</p>
                </div>
                <span className={`${color} text-3xl`}>{icon}</span>
            </CardContent>
        </Card>
    );
}