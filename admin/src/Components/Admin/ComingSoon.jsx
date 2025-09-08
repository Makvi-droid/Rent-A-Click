// Coming Soon Component
const ComingSoon = ({ title }) => (
  <div className="flex flex-col items-center justify-center h-96 bg-white rounded-2xl shadow-sm border border-gray-100">
    <div className="text-6xl mb-4">🚧</div>
    <h2 className="text-2xl font-bold text-gray-900 mb-2">{title}</h2>
    <p className="text-gray-600 text-center max-w-md">
      This section is currently under development. Check back soon for amazing features!
    </p>
  </div>
);

export default ComingSoon