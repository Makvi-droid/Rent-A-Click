function AuthToggle({ isSignUp, toggleMode }) {
  return (
    <div className="flex bg-slate-800/50 rounded-xl p-1 mb-8">
      <button
        type="button"
        onClick={() => toggleMode(false)}
        className={`flex-1 py-3 px-6 rounded-lg font-medium transition-all duration-200 ${
          !isSignUp
            ? 'bg-purple-600 text-white shadow-lg'
            : 'text-gray-400 hover:text-white'
        }`}
      >
        Sign In
      </button>
      <button
        type="button"
        onClick={() => toggleMode(true)}
        className={`flex-1 py-3 px-6 rounded-lg font-medium transition-all duration-200 ${
          isSignUp
            ? 'bg-purple-600 text-white shadow-lg'
            : 'text-gray-400 hover:text-white'
        }`}
      >
        Sign Up
      </button>
    </div>
  );
}

export default AuthToggle