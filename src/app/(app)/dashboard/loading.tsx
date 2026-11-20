export default function DashboardLoading() {
  return (
    <div className="flex flex-col gap-5 animate-pulse">
      <div className="space-y-2">
        <div
          className="h-8 w-48 rounded-xl"
          style={{ backgroundColor: 'var(--border)' }}
        />
        <div
          className="h-4 w-56 rounded-lg"
          style={{ backgroundColor: 'var(--border)' }}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <div
          className="h-48 rounded-3xl border md:col-span-3"
          style={{
            backgroundColor: 'var(--surface)',
            borderColor: 'var(--border)',
          }}
        />
        <div
          className="h-48 rounded-3xl border md:col-span-3"
          style={{
            backgroundColor: 'var(--surface)',
            borderColor: 'var(--border)',
          }}
        />
        <div
          className="h-52 rounded-3xl border md:col-span-3"
          style={{
            backgroundColor: 'var(--surface)',
            borderColor: 'var(--border)',
          }}
        />
        <div
          className="h-52 rounded-3xl border md:col-span-3"
          style={{
            backgroundColor: 'var(--surface)',
            borderColor: 'var(--border)',
          }}
        />
        <div
          className="h-40 rounded-3xl border md:col-span-2"
          style={{
            backgroundColor: 'var(--surface)',
            borderColor: 'var(--border)',
          }}
        />
        <div
          className="h-40 rounded-3xl border md:col-span-2"
          style={{
            backgroundColor: 'var(--surface)',
            borderColor: 'var(--border)',
          }}
        />
        <div
          className="h-40 rounded-3xl border md:col-span-2"
          style={{
            backgroundColor: 'var(--surface)',
            borderColor: 'var(--border)',
          }}
        />
      </div>
    </div>
  );
}