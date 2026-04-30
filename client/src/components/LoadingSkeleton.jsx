export default function LoadingSkeleton({ type = 'card', count = 3 }) {
  const cardSkeleton = (
    <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800 animate-pulse">
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-xl bg-gray-200 dark:bg-gray-700"></div>
        <div className="flex-1 space-y-3">
          <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
          <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-1/2"></div>
          <div className="flex gap-2">
            <div className="h-6 w-20 bg-gray-100 dark:bg-gray-800 rounded-full"></div>
            <div className="h-6 w-24 bg-gray-100 dark:bg-gray-800 rounded-full"></div>
          </div>
        </div>
      </div>
    </div>
  );

  const listSkeleton = (
    <div className="flex items-center gap-3 p-4 border-b border-gray-100 dark:border-gray-800 animate-pulse">
      <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700"></div>
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
        <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-1/3"></div>
      </div>
    </div>
  );

  const statsSkeleton = (
    <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-20 mb-2"></div>
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
          </div>
        ))}
      </div>
    </div>
  );

  const skeletons = {
    card: cardSkeleton,
    list: listSkeleton,
    stats: statsSkeleton,
  };

  return (
    <div className="space-y-4">
      {[...Array(count)].map((_, i) => (
        <div key={i} style={{ animationDelay: `${i * 0.1}s` }}>
          {skeletons[type]}
        </div>
      ))}
    </div>
  );
}