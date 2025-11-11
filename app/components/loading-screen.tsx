export default function () {
    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-8 animate-pulse">
            <div className="max-w-5xl mx-auto space-y-6">
                <div className="flex items-center justify-between">
                    <div className="space-y-2">
                        <div className="h-8 w-48 bg-gray-200 rounded" />
                        <div className="h-4 w-72 bg-gray-200 rounded" />
                    </div>
                    <div className="h-6 w-20 bg-gray-200 rounded" />
                </div>

                <div className="flex items-center gap-4 p-6 bg-white rounded-xl shadow">
                    <div className="h-20 w-20 bg-gray-200 rounded-full" />
                    <div className="flex-1 space-y-3">
                        <div className="h-6 w-40 bg-gray-200 rounded" />
                        <div className="h-4 w-64 bg-gray-200 rounded" />
                    </div>
                    <div className="h-10 w-28 bg-gray-200 rounded" />
                </div>

                <div className="grid grid-cols-3 gap-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-10 bg-gray-200 rounded" />
                    ))}
                </div>

                <div className="h-[600px] bg-white rounded-xl shadow p-6 space-y-4">
                    <div className="h-6 w-36 bg-gray-200 rounded" />
                    <div className="h-4 w-72 bg-gray-200 rounded" />

                    <div className="space-y-4 mt-6">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="h-12 bg-gray-200 rounded" />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}