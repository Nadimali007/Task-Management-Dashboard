import React, { useState } from 'react'
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { ChartContainer } from "@/components/ui/chart"

const dataSet = {
    week: [
        { label: "Mon", completed: 3, pending: 1 },
        { label: "Tue", completed: 5, pending: 2 },
        { label: "Wed", completed: 4, pending: 0 },
        { label: "Thu", completed: 6, pending: 3 },
        { label: "Fri", completed: 2, pending: 4 },
        { label: "Sat", completed: 1, pending: 1 },
        { label: "Sun", completed: 0, pending: 0 },
    ],
    month: [
        { label: "Week 1", completed: 18, pending: 5 },
        { label: "Week 2", completed: 22, pending: 8 },
        { label: "Week 3", completed: 15, pending: 4 },
        { label: "Week 4", completed: 25, pending: 3 },
    ]
}

const chartConfig = {
    completed: {
        label: "Completed",
        color: "#6366f1",
    },
    pending: {
        label: "Pending",
        color: "#4f46e5",
    },
}

export default function Performancechart({ className = "" }) {
    const [view, setView] = useState("week");

    return (
        <div className={`rounded-xl border border-zinc-800 bg-zinc-950 p-6 ${className}`}>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h3 className="text-white font-semibold text-sm tracking-wide">PRODUCTIVITY SUMMARY</h3>
                    <p className="text-zinc-400 text-xs mt-1">
                        Your performance over the last {view === "week" ? "7 days" : "30 days"}
                    </p>
                </div>


                <div className="flex gap-4 bg-zinc-900 p-1 rounded-lg border border-zinc-800">
                    <button
                        onClick={() => setView("week")}
                        className={`inline-flex items-center justify-center px-3 py-1 text-xs font-medium cursor-pointer transition-all  ${view === "week"
                                ? "bg-indigo-600 text-white shadow"
                                : "text-zinc-400 hover:text-white"
                            }`}
                    >
                        Week
                    </button>
                    <button
                        onClick={() => setView("month")}
                        className={`inline-flex items-center justify-center px-3 py-1 text-xs font-medium cursor-pointer transition-all  ${view === "month"
                                ? "bg-indigo-600 text-white shadow"
                                : "text-zinc-400 hover:text-white"
                            }`}
                    >
                        Month
                    </button>
                </div>
            </div>

            <ChartContainer config={chartConfig} className="h-[280px] w-full">
                <BarChart accessibilityLayer data={dataSet[view]}>
                    <CartesianGrid vertical={false} stroke="#1f1f23" />
                    <XAxis
                        dataKey="label"
                        stroke="#71717a"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        tick={{ fill: '#a1a1aa' }}
                    />
                    <YAxis
                        stroke="#71717a"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        tick={{ fill: '#a1a1aa' }}
                    />
                    <Bar dataKey="completed" fill="#6366f1" radius={[4, 4, 0, 0]} maxBarSize={45} />
                    <Bar dataKey="pending" fill="#312e81" radius={[4, 4, 0, 0]} maxBarSize={45} />
                </BarChart>
            </ChartContainer>
        </div>
    )
}