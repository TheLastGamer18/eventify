"use client";

import Link from "next/link";
import { ArrowLeft, CalendarDays, Users, Activity, Plus, FileText, IndianRupee } from "lucide-react";
import { type OrganizerAnalytics } from "@/lib/db";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from "recharts";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function DashboardClient({ data, user }: { data: OrganizerAnalytics; user: any }) {

    if (data.totalEvents === 0) {
        return (
            <main className="mx-auto max-w-site px-6 py-12">
                <div className="mb-8">
                    <h1 className="text-3xl font-black mb-2">Organizer Dashboard</h1>
                    <p className="text-muted-foreground">Track your events, attendees, and revenue.</p>
                </div>
                <div className="brutal-border brutal-shadow flex flex-col items-center rounded-lg bg-card py-16 text-center mt-8">
                    <FileText size={40} className="mb-3 text-muted-foreground" />
                    <p className="text-lg font-bold">No data to display yet</p>
                    <p className="text-sm text-muted-foreground mb-6">
                        Host an event to start seeing analytics.
                    </p>
                    <Link href="/create" className="inline-flex items-center gap-2 rounded-md bg-brutal-pink px-6 py-3 text-sm font-bold brutal-border brutal-shadow-sm brutal-hover">
                        <Plus size={16} /> Create Your First Event
                    </Link>
                </div>
            </main>
        );
    }

    return (
        <main className="mx-auto max-w-site px-6 py-12">
            <div className="mb-8">
                <h1 className="text-3xl font-black mb-2">Organizer Dashboard</h1>
                <p className="text-muted-foreground">Welcome back, {user.name.split(" ")[0]}. Here's how your events are performing.</p>
            </div>

            {/* Stat Cards */}
            <div className="grid gap-6 md:grid-cols-3 mb-8">
                <div className="brutal-border brutal-shadow-sm rounded-lg bg-brutal-cyan p-6 flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-black/70">Total Events Hosted</h3>
                        <div className="p-2 bg-black/10 rounded-md">
                            <CalendarDays size={20} className="text-black" />
                        </div>
                    </div>
                    <p className="text-4xl font-black text-black">{data.totalEvents}</p>
                </div>

                <div className="brutal-border brutal-shadow-sm rounded-lg bg-brutal-lime p-6 flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-black/70">Total Attendees</h3>
                        <div className="p-2 bg-black/10 rounded-md">
                            <Users size={20} className="text-black" />
                        </div>
                    </div>
                    <p className="text-4xl font-black text-black">{data.totalAttendees}</p>
                </div>

                <div className="brutal-border brutal-shadow-sm rounded-lg bg-[#facc15] p-6 flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-black/70">Total Revenue</h3>
                        <div className="p-2 bg-black/10 rounded-md">
                            <IndianRupee size={20} className="text-black" />
                        </div>
                    </div>
                    <p className="text-4xl font-black text-black">₹{data.totalRevenue.toLocaleString()}</p>
                </div>
            </div>

            {/* Charts Section */}
            <div className="grid gap-6 lg:grid-cols-2 mb-8">
                {/* Registration Timeline Line Chart */}
                <div className="brutal-border brutal-shadow-sm rounded-lg bg-card p-6">
                    <h2 className="text-xl font-extrabold mb-6 flex items-center gap-2">
                        <Activity size={20} className="text-brutal-pink" /> 30-Day Registration Timeline
                    </h2>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={data.timeline} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                                <Line type="monotone" dataKey="registrations" stroke="#e85d75" strokeWidth={3} dot={{ r: 4, fill: '#e85d75' }} activeDot={{ r: 6 }} />
                                <CartesianGrid stroke="#ccc" strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="date" tick={{ fontSize: 12 }} tickMargin={10} minTickGap={20} />
                                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                                <RechartsTooltip
                                    contentStyle={{ borderRadius: '8px', border: '3px solid black', fontWeight: 'bold' }}
                                    formatter={(value: number) => [`${value} Registrations`, '']}
                                    labelStyle={{ color: 'black', marginBottom: '4px' }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Top Events Bar Chart */}
                <div className="brutal-border brutal-shadow-sm rounded-lg bg-card p-6">
                    <h2 className="text-xl font-extrabold mb-6 flex items-center gap-2">
                        <Users size={20} className="text-brutal-cyan" /> Top Performing Events
                    </h2>
                    <div className="h-[300px] w-full">
                        {data.topEvents.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={data.topEvents} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                                    <CartesianGrid stroke="#ccc" strokeDasharray="3 3" vertical={false} opacity={0.4} />
                                    <XAxis dataKey="name" tick={{ fontSize: 12 }} tickMargin={10} tickFormatter={(value) => value.length > 15 ? `${value.substring(0, 15)}...` : value} />
                                    <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                                    <RechartsTooltip
                                        contentStyle={{ borderRadius: '8px', border: '3px solid black', fontWeight: 'bold', backgroundColor: 'var(--card)', color: 'var(--card-foreground)' }}
                                        cursor={{ fill: 'rgba(150,150,150,0.1)' }}
                                    />
                                    <Bar dataKey="attendees" fill="#4dcb7a" name="Attendees" radius={[4, 4, 0, 0]} barSize={40} />
                                    <Bar dataKey="maxOccupancy" fill="#94a3b8" name="Capacity" radius={[4, 4, 0, 0]} barSize={40} opacity={0.5} />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex items-center justify-center text-muted-foreground font-bold">
                                No attendees yet
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Recent Registrations Table */}
            <div className="brutal-border brutal-shadow-sm rounded-lg bg-card p-6">
                <h2 className="text-xl font-extrabold mb-6">Recent Registrations</h2>
                {data.recentRegistrations.length === 0 ? (
                    <p className="text-muted-foreground text-sm font-bold py-8 text-center border-t border-dashed">No signups yet. Keep promoting your events!</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs uppercase bg-muted/50 border-b-2 border-black">
                                <tr>
                                    <th className="px-4 py-3 font-black">Attendee</th>
                                    <th className="px-4 py-3 font-black">Event</th>
                                    <th className="px-4 py-3 font-black">Status</th>
                                    <th className="px-4 py-3 font-black text-right">Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.recentRegistrations.map((reg) => (
                                    <tr key={reg.id} className="border-b border-border hover:bg-muted/30">
                                        <td className="px-4 py-3 border-r border-border">
                                            <div className="font-bold">{reg.userName}</div>
                                            <div className="text-xs text-muted-foreground">{reg.userEmail}</div>
                                        </td>
                                        <td className="px-4 py-3 font-semibold border-r border-border max-w-[200px] truncate" title={reg.eventName}>
                                            {reg.eventName}
                                        </td>
                                        <td className="px-4 py-3 border-r border-border">
                                            {reg.status === 'confirmed' ? (
                                                <span className="inline-flex px-2 py-1 text-[10px] font-bold text-green-800 bg-green-100 border border-green-300 rounded-full uppercase tracking-wider">
                                                    Confirmed
                                                </span>
                                            ) : (
                                                <span className="inline-flex px-2 py-1 text-[10px] font-bold text-yellow-800 bg-yellow-100 border border-yellow-300 rounded-full uppercase tracking-wider">
                                                    Pending
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-right text-muted-foreground font-medium whitespace-nowrap">
                                            {new Date(reg.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

        </main>
    );
}
