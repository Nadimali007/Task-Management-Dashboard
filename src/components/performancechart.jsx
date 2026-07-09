import React, { useState, useMemo } from 'react';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { ChartContainer } from "@/components/ui/chart";
import { isSameWeek, isSameMonth, getWeekOfMonth, parseISO, getDay } from 'date-fns';

const chartConfig = {
    completed: {
        label: "Completed",
        color: "#6366f1",
    },
    pending: {
        label: "Pending",
        color: "#FF8C54",
    },
}

export default function Performancechart({ className = "", tasks = [] }) {
    const [view, setView] = useState("week");

    const chartData = useMemo(() => {
        const weekData = [
            { label: "Mon", completed: 0, pending: 0, dayNum: 1 },
            { label: "Tue", completed: 0, pending: 0, dayNum: 2 },
            { label: "Wed", completed: 0, pending: 0, dayNum: 3 },
            { label: "Thu", completed: 0, pending: 0, dayNum: 4 },
            { label: "Fri", completed: 0, pending: 0, dayNum: 5 },
            { label: "Sat", completed: 0, pending: 0, dayNum: 6 },
            { label: "Sun", completed: 0, pending: 0, dayNum: 0 },
        ];

        const monthData = [
            { label: "Week 1", completed: 0, pending: 0 },
            { label: "Week 2", completed: 0, pending: 0 },
            { label: "Week 3", completed: 0, pending: 0 },
            { label: "Week 4", completed: 0, pending: 0 },
        ];

        const now = new Date();

        tasks.forEach(task => {
            const dateString = task.issuedate || task.finaldate;
            if (!dateString) return;

            const taskDate = parseISO(dateString);
            const isCompleted = task.status === "Completed";

            if (isSameWeek(taskDate, now, { weekStartsOn: 1 })) {
                const dayIndex = getDay(taskDate);
                const targetDay = weekData.find(d => d.dayNum === dayIndex);
                if (targetDay) {
                    if (isCompleted) targetDay.completed += 1;
                    else targetDay.pending += 1;
                }
            }

            if (isSameMonth(taskDate, now)) {
                const weekNumber = getWeekOfMonth(taskDate, { weekStartsOn: 1 });
                const bucketIndex = Math.min(weekNumber - 1, 3);

                if (isCompleted) {
                    monthData[bucketIndex].completed += 1;
                }
                else {
                    monthData[bucketIndex].pending += 1;
                }
            }
        });

        const cleanedWeekData = weekData.map(({ label, completed, pending }) => ({ label, completed, pending }));
        return { week: cleanedWeekData, month: monthData };
    }, [tasks]);

    return (
        <div className={`rounded-xl border border-zinc-800 bg-zinc-950 p-6 w-full ${className}`}>
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h3 className="text-white font-semibold text-sm tracking-wide">PRODUCTIVITY SUMMARY</h3>
                    <p className="text-zinc-400 text-xs mt-1 mb-3">
                        Your performance over the current {view === "week" ? "week" : "month"}
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
            <ChartContainer config={chartConfig} className="h-[280px] w-full min-h-[280px]">
                <BarChart height={280} data={chartData[view]}>
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
                        allowDecimals={false}
                    />
                    <Bar dataKey="completed" fill="#6366f1" radius={[4, 4, 0, 0]} maxBarSize={45} />
                    <Bar dataKey="pending" fill="#FF8C54" radius={[4, 4, 0, 0]} maxBarSize={45} />
                </BarChart>
            </ChartContainer>
            <div className="flex gap-4 items-center">
                <div className="flex items-center gap-1.5 text-xs text-zinc-300">
                    <span className="w-3 h-3  bg-[#6366f1]" />
                    <span>Completed</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-zinc-300">
                    <span className="w-3 h-3 bg-[#FF8C54]" />
                    <span>Pending</span>
                </div>
            </div>
        </div>
    )
}